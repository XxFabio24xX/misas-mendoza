-- M-2 (cierre): el REVOKE de 021 no bastó porque handle_new_user tenía además un
-- grant a PUBLIC (=X/postgres en la ACL), que anon/authenticated heredan. Se revoca
-- también de PUBLIC. Es una función de trigger: revocar EXECUTE no afecta el disparo
-- de triggers (no requiere privilegio del usuario), solo elimina su exposición como
-- RPC pública en /rest/v1/rpc/handle_new_user. postgres y service_role conservan acceso.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
