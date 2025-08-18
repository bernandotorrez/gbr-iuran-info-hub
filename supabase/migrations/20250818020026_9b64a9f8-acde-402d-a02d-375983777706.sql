-- Create RPC functions for UMKM operations

-- Function to get UMKM with tags for public view
CREATE OR REPLACE FUNCTION public.get_public_umkm()
RETURNS TABLE (
  id uuid,
  nama_umkm character varying,
  deskripsi text,
  nomor_telepon character varying,
  email character varying,
  website character varying,
  jam_operasional text,
  gambar_url text,
  status character varying,
  slug_url character varying,
  warga_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  warga_name text,
  tags json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.nama_umkm,
    u.deskripsi,
    u.nomor_telepon,
    u.email,
    u.website,
    u.jam_operasional,
    u.gambar_url,
    u.status,
    u.slug_url,
    u.warga_id,
    u.created_at,
    u.updated_at,
    COALESCE(
      w.nama_suami || CASE 
        WHEN w.nama_istri IS NOT NULL AND w.nama_istri != '' 
        THEN ' & ' || w.nama_istri 
        ELSE '' 
      END,
      ''
    ) as warga_name,
    COALESCE(
      (SELECT json_agg(
        json_build_object(
          'id', t.id,
          'nama_tag', t.nama_tag,
          'warna', t.warna,
          'deskripsi', t.deskripsi
        )
      )
      FROM umkm_tags ut
      JOIN tag_umkm t ON ut.tag_id = t.id
      WHERE ut.umkm_id = u.id),
      '[]'::json
    ) as tags
  FROM umkm u
  LEFT JOIN warga_new w ON u.warga_id = w.id
  WHERE u.status = 'aktif'
  ORDER BY u.created_at DESC;
END;
$$;

-- Function to get UMKM by slug
CREATE OR REPLACE FUNCTION public.get_umkm_by_slug(slug_param text)
RETURNS TABLE (
  id uuid,
  nama_umkm character varying,
  deskripsi text,
  nomor_telepon character varying,
  email character varying,
  website character varying,
  jam_operasional text,
  gambar_url text,
  status character varying,
  slug_url character varying,
  warga_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  warga_name text,
  tags json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.nama_umkm,
    u.deskripsi,
    u.nomor_telepon,
    u.email,
    u.website,
    u.jam_operasional,
    u.gambar_url,
    u.status,
    u.slug_url,
    u.warga_id,
    u.created_at,
    u.updated_at,
    COALESCE(
      w.nama_suami || CASE 
        WHEN w.nama_istri IS NOT NULL AND w.nama_istri != '' 
        THEN ' & ' || w.nama_istri 
        ELSE '' 
      END,
      ''
    ) as warga_name,
    COALESCE(
      (SELECT json_agg(
        json_build_object(
          'id', t.id,
          'nama_tag', t.nama_tag,
          'warna', t.warna,
          'deskripsi', t.deskripsi
        )
      )
      FROM umkm_tags ut
      JOIN tag_umkm t ON ut.tag_id = t.id
      WHERE ut.umkm_id = u.id),
      '[]'::json
    ) as tags
  FROM umkm u
  LEFT JOIN warga_new w ON u.warga_id = w.id
  WHERE u.slug_url = slug_param
  LIMIT 1;
END;
$$;

-- Function to get UMKM with details for admin
CREATE OR REPLACE FUNCTION public.get_umkm_with_details()
RETURNS TABLE (
  id uuid,
  nama_umkm character varying,
  deskripsi text,
  nomor_telepon character varying,
  email character varying,
  website character varying,
  jam_operasional text,
  gambar_url text,
  status character varying,
  slug_url character varying,
  warga_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  warga_name text,
  tags json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.nama_umkm,
    u.deskripsi,
    u.nomor_telepon,
    u.email,
    u.website,
    u.jam_operasional,
    u.gambar_url,
    u.status,
    u.slug_url,
    u.warga_id,
    u.created_at,
    u.updated_at,
    COALESCE(
      w.nama_suami || CASE 
        WHEN w.nama_istri IS NOT NULL AND w.nama_istri != '' 
        THEN ' & ' || w.nama_istri 
        ELSE '' 
      END,
      ''
    ) as warga_name,
    COALESCE(
      (SELECT json_agg(
        json_build_object(
          'id', t.id,
          'nama_tag', t.nama_tag,
          'warna', t.warna,
          'deskripsi', t.deskripsi
        )
      )
      FROM umkm_tags ut
      JOIN tag_umkm t ON ut.tag_id = t.id
      WHERE ut.umkm_id = u.id),
      '[]'::json
    ) as tags
  FROM umkm u
  LEFT JOIN warga_new w ON u.warga_id = w.id
  ORDER BY u.created_at DESC;
END;
$$;

-- Function to add UMKM with tags
CREATE OR REPLACE FUNCTION public.add_umkm_with_tags(
  umkm_data json,
  tag_ids text[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_umkm_id uuid;
  tag_id text;
BEGIN
  -- Insert UMKM
  INSERT INTO umkm (
    nama_umkm, deskripsi, nomor_telepon, email, website, 
    jam_operasional, gambar_url, status, warga_id, slug_url
  )
  VALUES (
    (umkm_data->>'nama_umkm')::character varying,
    umkm_data->>'deskripsi',
    (umkm_data->>'nomor_telepon')::character varying,
    (umkm_data->>'email')::character varying,
    (umkm_data->>'website')::character varying,
    umkm_data->>'jam_operasional',
    umkm_data->>'gambar_url',
    COALESCE((umkm_data->>'status')::character varying, 'aktif'),
    (umkm_data->>'warga_id')::uuid,
    (umkm_data->>'slug_url')::character varying
  )
  RETURNING id INTO new_umkm_id;

  -- Insert tags
  FOREACH tag_id IN ARRAY tag_ids
  LOOP
    INSERT INTO umkm_tags (umkm_id, tag_id)
    VALUES (new_umkm_id, tag_id::uuid);
  END LOOP;

  RETURN new_umkm_id;
END;
$$;

-- Function to update UMKM with tags
CREATE OR REPLACE FUNCTION public.update_umkm_with_tags(
  umkm_id_param uuid,
  umkm_data json,
  tag_ids text[]
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tag_id text;
BEGIN
  -- Update UMKM
  UPDATE umkm 
  SET 
    nama_umkm = (umkm_data->>'nama_umkm')::character varying,
    deskripsi = umkm_data->>'deskripsi',
    nomor_telepon = (umkm_data->>'nomor_telepon')::character varying,
    email = (umkm_data->>'email')::character varying,
    website = (umkm_data->>'website')::character varying,
    jam_operasional = umkm_data->>'jam_operasional',
    gambar_url = umkm_data->>'gambar_url',
    status = COALESCE((umkm_data->>'status')::character varying, 'aktif'),
    warga_id = (umkm_data->>'warga_id')::uuid,
    slug_url = (umkm_data->>'slug_url')::character varying,
    updated_at = now()
  WHERE id = umkm_id_param;

  -- Delete existing tags
  DELETE FROM umkm_tags WHERE umkm_id = umkm_id_param;

  -- Insert new tags
  FOREACH tag_id IN ARRAY tag_ids
  LOOP
    INSERT INTO umkm_tags (umkm_id, tag_id)
    VALUES (umkm_id_param, tag_id::uuid);
  END LOOP;

  RETURN true;
END;
$$;

-- Function to delete UMKM with tags
CREATE OR REPLACE FUNCTION public.delete_umkm_with_tags(umkm_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete tags first (foreign key constraint)
  DELETE FROM umkm_tags WHERE umkm_id = umkm_id_param;
  
  -- Delete UMKM
  DELETE FROM umkm WHERE id = umkm_id_param;
  
  RETURN true;
END;
$$;