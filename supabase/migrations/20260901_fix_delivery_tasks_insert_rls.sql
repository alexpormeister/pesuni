const { runSql } = require('C:/Users/Alex/Desktop/pesuni/scripts/db.js');

const sql = `
-- 1. Lisätään delivery_tasks taululle INSERT-sääntö
DROP POLICY IF EXISTS "Allow insert on delivery_tasks" ON public.delivery_tasks;
DROP POLICY IF EXISTS "Allow authenticated and service insert delivery tasks" ON public.delivery_tasks;

CREATE POLICY "Allow authenticated and service insert delivery tasks"
ON public.delivery_tasks
FOR INSERT
TO authenticated, anon, service_role
WITH CHECK (true);

-- 2. Korjataan create_delivery_tasks_for_order SECURITY DEFINERiksi
CREATE OR REPLACE FUNCTION public.create_delivery_tasks_for_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_laundry RECORD;
  v_total_payout NUMERIC;
  v_half NUMERIC;
  v_customer_name TEXT;
  v_laundry_name TEXT;
  v_laundry_address TEXT;
  v_laundry_phone TEXT;
BEGIN
  IF NEW.laundry_id IS NOT NULL THEN
    SELECT * INTO v_laundry FROM public.laundries WHERE id = NEW.laundry_id;
  END IF;

  v_laundry_name := COALESCE(v_laundry.name, 'Pesula (määritetään)');
  v_laundry_address := COALESCE(v_laundry.address, '');
  v_laundry_phone := COALESCE(v_laundry.contact_phone, '');
  v_customer_name := TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));

  SELECT COALESCE(SUM(driver_payout), 0) INTO v_total_payout
  FROM public.order_items WHERE order_id = NEW.id;

  IF v_total_payout = 0 THEN
    v_total_payout := COALESCE(ROUND((COALESCE(NEW.price, 45) * 0.40)::numeric, 2), 38.00);
  END IF;

  v_half := ROUND(v_total_payout / 2.0, 2);

  -- Noutotehtävä (LEG 1): Aluksi 'pending' (aukeaa kun pesula hyväksyy)
  INSERT INTO public.delivery_tasks (
    order_id, task_type, laundry_id,
    origin_name, origin_address, origin_phone,
    destination_name, destination_address, destination_phone,
    pickup_name, pickup_address, pickup_phone,
    delivery_name, delivery_address, delivery_phone,
    scheduled_date, scheduled_time, scheduled_time_slot, status, driver_payout
  ) VALUES (
    NEW.id, 'pickup', NEW.laundry_id,
    v_customer_name, NEW.address, NEW.phone,
    v_laundry_name, v_laundry_address, v_laundry_phone,
    v_customer_name, NEW.address, NEW.phone,
    v_laundry_name, v_laundry_address, v_laundry_phone,
    NEW.pickup_date, 
    CASE WHEN NEW.pickup_time IS NOT NULL THEN to_char(NEW.pickup_time, 'HH24:MI') ELSE '10:00' END,
    CASE WHEN NEW.pickup_time IS NOT NULL THEN to_char(NEW.pickup_time, 'HH24:MI') ELSE '10:00' END,
    'pending', 
    v_half
  );

  -- Palautustehtävä (LEG 2): Aluksi 'pending' (aukeaa vasta kun pesula merkitsee valmiiksi)
  INSERT INTO public.delivery_tasks (
    order_id, task_type, laundry_id,
    origin_name, origin_address, origin_phone,
    destination_name, destination_address, destination_phone,
    pickup_name, pickup_address, pickup_phone,
    delivery_name, delivery_address, delivery_phone,
    scheduled_date, scheduled_time, scheduled_time_slot, status, driver_payout
  ) VALUES (
    NEW.id, 'delivery', NEW.laundry_id,
    v_laundry_name, v_laundry_address, v_laundry_phone,
    v_customer_name, NEW.address, NEW.phone,
    v_laundry_name, v_laundry_address, v_laundry_phone,
    v_customer_name, NEW.address, NEW.phone,
    NEW.return_date, 
    CASE WHEN NEW.return_time IS NOT NULL THEN to_char(NEW.return_time, 'HH24:MI') ELSE '16:00' END,
    CASE WHEN NEW.return_time IS NOT NULL THEN to_char(NEW.return_time, 'HH24:MI') ELSE '16:00' END,
    'pending', 
    v_total_payout - v_half
  );

  RETURN NEW;
END;
$$;

-- 3. Korjataan activate_return_task SECURITY DEFINERiksi
CREATE OR REPLACE FUNCTION public.activate_return_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tracking_status::text IN ('PACKAGING', 'READY_FOR_DELIVERY') AND 
     (OLD.tracking_status IS NULL OR OLD.tracking_status::text NOT IN ('PACKAGING', 'READY_FOR_DELIVERY')) THEN
    UPDATE public.delivery_tasks
    SET status = 'unassigned', updated_at = now()
    WHERE order_id = NEW.id AND task_type = 'delivery' AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Korjataan handle_laundry_decision SECURITY DEFINERiksi
CREATE OR REPLACE FUNCTION public.handle_laundry_decision()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_laundry RECORD;
BEGIN
  IF NEW.laundry_status IS DISTINCT FROM OLD.laundry_status THEN
    IF NEW.laundry_status = 'accepted' THEN
      IF NEW.laundry_id IS NOT NULL THEN
        SELECT * INTO v_laundry FROM public.laundries WHERE id = NEW.laundry_id;
      END IF;

      -- 1. Pickup (Meno)
      UPDATE public.delivery_tasks
      SET laundry_id = NEW.laundry_id,
          destination_name = COALESCE(v_laundry.name, 'Pesula'),
          destination_address = COALESCE(v_laundry.address, ''),
          destination_phone = COALESCE(v_laundry.contact_phone, ''),
          delivery_name = COALESCE(v_laundry.name, 'Pesula'),
          delivery_address = COALESCE(v_laundry.address, ''),
          status = 'unassigned',
          updated_at = now()
      WHERE order_id = NEW.id AND task_type = 'pickup' AND status = 'pending';

      -- 2. Delivery (Paluu)
      UPDATE public.delivery_tasks
      SET laundry_id = NEW.laundry_id,
          origin_name = COALESCE(v_laundry.name, 'Pesula'),
          origin_address = COALESCE(v_laundry.address, ''),
          origin_phone = COALESCE(v_laundry.contact_phone, ''),
          pickup_name = COALESCE(v_laundry.name, 'Pesula'),
          pickup_address = COALESCE(v_laundry.address, ''),
          status = 'pending',
          updated_at = now()
      WHERE order_id = NEW.id AND task_type = 'delivery';

    ELSIF NEW.laundry_status = 'rejected' THEN
      UPDATE public.delivery_tasks
      SET status = 'cancelled', updated_at = now()
      WHERE order_id = NEW.id;
      NEW.status := 'rejected'::order_status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 5. Korjataan lokitus-triggerit SECURITY DEFINERiksi
CREATE OR REPLACE FUNCTION public.log_delivery_task_events()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task_label TEXT;
  v_driver_name TEXT;
BEGIN
  v_task_label := CASE WHEN NEW.task_type = 'pickup' THEN 'Noutokeikka (Meno)' ELSE 'Palautuskeikka (Paluu)' END;

  -- Tehtävän tilan muutos
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.log_order_change(
      NEW.order_id,
      'task_status_changed',
      jsonb_build_object('task_id', OLD.id, 'task_type', OLD.task_type, 'status', OLD.status),
      jsonb_build_object('task_id', NEW.id, 'task_type', NEW.task_type, 'status', NEW.status),
      v_task_label || ' tila muuttui: ' || COALESCE(OLD.status, '-') || ' -> ' || NEW.status
    );
  END IF;

  -- Kuljettaja otti tehtävän
  IF NEW.driver_id IS DISTINCT FROM OLD.driver_id AND NEW.driver_id IS NOT NULL THEN
    SELECT TRIM(first_name || ' ' || last_name) INTO v_driver_name FROM public.profiles WHERE id = NEW.driver_id;

    PERFORM public.log_order_change(
      NEW.order_id,
      'task_driver_assigned',
      jsonb_build_object('task_id', NEW.id, 'task_type', NEW.task_type, 'old_driver_id', OLD.driver_id),
      jsonb_build_object('task_id', NEW.id, 'task_type', NEW.task_type, 'new_driver_id', NEW.driver_id),
      'Kuljettaja (' || COALESCE(v_driver_name, 'Kuski') || ') otti vastaan tehtävän: ' || v_task_label
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_order_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.log_order_change(
    NEW.id,
    'created',
    NULL,
    row_to_json(NEW)::jsonb,
    'Tilaus luotu asiakkaan toimesta'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_laundry_name TEXT;
  v_driver_name TEXT;
BEGIN
  -- A. Tilauksen päästatus (status) muuttui
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status IN ('rejected', 'cancelled') THEN
      UPDATE public.delivery_tasks
      SET status = 'cancelled', updated_at = now()
      WHERE order_id = NEW.id AND status != 'completed';
    END IF;

    PERFORM public.log_order_change(
      NEW.id,
      'status_changed',
      jsonb_build_object('status', OLD.status::text),
      jsonb_build_object('status', NEW.status::text),
      CASE 
        WHEN NEW.status = 'picking_up' THEN 'Kuljettaja aloitti noudon asiakkaalta'
        WHEN NEW.status = 'washing' THEN 'Tilaus toimitettu pesulaan ja siirretty pesuun'
        WHEN NEW.status = 'returning' THEN 'Kuljettaja aloitti palautustoimituksen asiakkaalle'
        WHEN NEW.status = 'delivered' THEN 'Tilaus toimitettu asiakkaalle (Valmis)'
        WHEN NEW.status = 'rejected' THEN 'Tilaus hylätty'
        WHEN NEW.status = 'cancelled' THEN 'Tilaus peruutettu'
        ELSE 'Tilauksen tila muuttui: ' || COALESCE(OLD.status::text, '-') || ' -> ' || NEW.status::text
      END
    );
  END IF;

  -- B. Seurantatila (tracking_status) muuttui
  IF NEW.tracking_status IS DISTINCT FROM OLD.tracking_status THEN
    PERFORM public.log_order_change(
      NEW.id,
      'tracking_status_changed',
      jsonb_build_object('tracking_status', OLD.tracking_status::text),
      jsonb_build_object('tracking_status', NEW.tracking_status::text),
      CASE 
        WHEN NEW.tracking_status::text = 'PICKED_UP' THEN 'Kuljettaja nouti pyykit asiakkaalta'
        WHEN NEW.tracking_status::text = 'WASHING' THEN 'Pyykit ovat pesulassa käsittelyssä'
        WHEN NEW.tracking_status::text = 'PACKAGING' THEN 'Pesula merkkasi pyykit pestyiksi ja valmiiksi palautusta varten'
        WHEN NEW.tracking_status::text = 'OUT_FOR_DELIVERY' THEN 'Pyykit ovat kuljettajan kyydissä matkalla asiakkaalle'
        WHEN NEW.tracking_status::text = 'COMPLETED' THEN 'Pyykit luovutettu onnistuneesti asiakkaalle'
        ELSE 'Seurantatila muuttui: ' || COALESCE(OLD.tracking_status::text, '-') || ' -> ' || NEW.tracking_status::text
      END
    );
  END IF;

  -- C. Pesulan tila (laundry_status tai laundry_id) muuttui
  IF NEW.laundry_status IS DISTINCT FROM OLD.laundry_status OR NEW.laundry_id IS DISTINCT FROM OLD.laundry_id THEN
    IF NEW.laundry_id IS NOT NULL THEN
      SELECT name INTO v_laundry_name FROM public.laundries WHERE id = NEW.laundry_id;
    END IF;

    PERFORM public.log_order_change(
      NEW.id,
      'laundry_decision',
      jsonb_build_object('laundry_status', OLD.laundry_status, 'laundry_id', OLD.laundry_id),
      jsonb_build_object('laundry_status', NEW.laundry_status, 'laundry_id', NEW.laundry_id),
      CASE 
        WHEN NEW.laundry_status = 'accepted' THEN 'Pesula (' || COALESCE(v_laundry_name, 'Pesula') || ') hyväksyi tilauksen'
        WHEN NEW.laundry_status = 'rejected' THEN 'Pesula hylkäsi tilauksen'
        ELSE 'Pesulan tila muuttui: ' || COALESCE(NEW.laundry_status, '-')
      END
    );
  END IF;

  -- D. Kuljettajan määritys (driver_id) muuttui
  IF NEW.driver_id IS DISTINCT FROM OLD.driver_id THEN
    IF NEW.driver_id IS NOT NULL THEN
      SELECT TRIM(first_name || ' ' || last_name) INTO v_driver_name FROM public.profiles WHERE id = NEW.driver_id;
    END IF;

    PERFORM public.log_order_change(
      NEW.id,
      'driver_assigned',
      jsonb_build_object('driver_id', OLD.driver_id),
      jsonb_build_object('driver_id', NEW.driver_id),
      CASE 
        WHEN NEW.driver_id IS NOT NULL THEN 'Kuljettaja (' || COALESCE(v_driver_name, 'Kuski') || ') otti keikan vastaan'
        ELSE 'Kuljettaja poistettiin tilaukselta'
      END
    );
  END IF;

  -- E. Paino tai valokuvat tallennettu
  IF NEW.pickup_weight_kg IS DISTINCT FROM OLD.pickup_weight_kg THEN
    PERFORM public.log_order_change(
      NEW.id,
      'weight_measured',
      jsonb_build_object('pickup_weight_kg', OLD.pickup_weight_kg),
      jsonb_build_object('pickup_weight_kg', NEW.pickup_weight_kg),
      'Pyykin paino mitattu: ' || NEW.pickup_weight_kg::text || ' kg'
    );
  END IF;

  IF NEW.pickup_photos IS DISTINCT FROM OLD.pickup_photos THEN
    PERFORM public.log_order_change(
      NEW.id,
      'photos_uploaded',
      jsonb_build_object('photos_count', coalesce(array_length(OLD.pickup_photos, 1), 0)),
      jsonb_build_object('photos_count', coalesce(array_length(NEW.pickup_photos, 1), 0), 'photos', NEW.pickup_photos),
      'Tuotekuvat tallennettu noudon yhteydessä (' || coalesce(array_length(NEW.pickup_photos, 1), 0)::text || ' kpl)'
    );
  END IF;

  -- F. Osoite tai erikoisohjeet muuttuivat
  IF NEW.address IS DISTINCT FROM OLD.address THEN
    PERFORM public.log_order_change(
      NEW.id,
      'address_changed',
      jsonb_build_object('address', OLD.address),
      jsonb_build_object('address', NEW.address),
      'Toimitusosoite muuttui: ' || COALESCE(OLD.address, '-') || ' -> ' || NEW.address
    );
  END IF;

  IF NEW.special_instructions IS DISTINCT FROM OLD.special_instructions THEN
    PERFORM public.log_order_change(
      NEW.id,
      'instructions_changed',
      jsonb_build_object('instructions', OLD.special_instructions),
      jsonb_build_object('instructions', NEW.special_instructions),
      'Erityisohjeita muokattiin'
    );
  END IF;

  RETURN NEW;
END;
$$;
`;

async function run() {
  await runSql(sql);
  console.log('Successfully updated delivery_tasks RLS policy and all trigger functions to SECURITY DEFINER!');
}

run().catch(console.error);
