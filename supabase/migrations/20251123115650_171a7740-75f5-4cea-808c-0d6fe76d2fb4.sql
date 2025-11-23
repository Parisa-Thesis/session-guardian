-- Remove problematic triggers from children and devices tables
DROP TRIGGER IF EXISTS update_children_updated_at ON public.children;
DROP TRIGGER IF EXISTS update_devices_updated_at ON public.devices;