-- Fix public_bucket_allows_listing: el bucket imagenes_capillas es público, así que
-- el acceso a cada imagen por su URL directa (/object/public/imagenes_capillas/<archivo>)
-- funciona SIN RLS. La policy SELECT "Cualquiera puede ver fotos" (rol public) solo
-- habilitaba además el LISTADO/enumeración de todos los archivos por parte de anónimos,
-- algo que la app nunca usa (sube con getPublicUrl + upload upsert:false, sin .list()).
-- Se elimina esa policy: se conserva el acceso por URL directa y se corta el listado.
DROP POLICY "Cualquiera puede ver fotos" ON storage.objects;
