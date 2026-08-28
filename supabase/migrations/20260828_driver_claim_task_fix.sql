-- 🌟 VAHVISTETTU JA ATOMINEN KULJETTAJAN KEIKAN VASTAANOTTO (RPC) 🌟

CREATE OR REPLACE FUNCTION public.driver_claim_task(p_task_id TEXT)
RETURNS JSON AS 
DECLARE
    v_task public.delivery_tasks%ROWTYPE;
    v_task_uuid UUID;
    v_current_user UUID;
BEGIN
    v_current_user := auth.uid();
    
    IF v_current_user IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Ei kirjautunutta käyttäjää');
    END IF;

    -- Yritetään muuntaa p_task_id UUID:ksi turvallisesti
    BEGIN
        v_task_uuid := p_task_id::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_task_uuid := NULL;
    END;

    -- 1. Etsitään delivery_tasks taulusta id:llä tai order_id:llä
    IF v_task_uuid IS NOT NULL THEN
        SELECT * INTO v_task 
        FROM public.delivery_tasks 
        WHERE (id = v_task_uuid OR order_id = v_task_uuid)
        FOR UPDATE;
    END IF;

    IF FOUND THEN
        -- Jos keikalla on jo toinen kuljettaja
        IF v_task.driver_id IS NOT NULL AND v_task.driver_id != v_current_user THEN
            RETURN json_build_object('success', false, 'error', 'Keikka on jo toisen kuljettajan ottama');
        END IF;

        -- Päivitetään delivery_tasks
        UPDATE public.delivery_tasks
        SET driver_id = v_current_user, 
            status = 'assigned', 
            updated_at = now()
        WHERE id = v_task.id;

        -- Päivitetään myös pääosasto / orders
        IF v_task.order_id IS NOT NULL THEN
            UPDATE public.orders
            SET driver_id = v_current_user, 
                updated_at = now()
            WHERE id = v_task.order_id;
        END IF;

        RETURN json_build_object('success', true);
    END IF;

    -- 2. Jos delivery_tasks -riviä ei ollut, mutta orders-taulussa on vapaa tilaus
    IF v_task_uuid IS NOT NULL AND EXISTS (SELECT 1 FROM public.orders WHERE id = v_task_uuid) THEN
        UPDATE public.orders
        SET driver_id = v_current_user, 
            updated_at = now()
        WHERE id = v_task_uuid AND (driver_id IS NULL OR driver_id = v_current_user);

        -- Luodaan noutotehtävä jos puuttui
        INSERT INTO public.delivery_tasks (
            order_id,
            driver_id,
            task_type,
            status,
            created_at,
            updated_at
        ) VALUES (
            v_task_uuid,
            v_current_user,
            'pickup',
            'assigned',
            now(),
            now()
        )
        ON CONFLICT DO NOTHING;

        RETURN json_build_object('success', true);
    END IF;

    RETURN json_build_object('success', false, 'error', 'Keikkaa ei löytynyt');
END;
 LANGUAGE plpgsql SECURITY DEFINER;
