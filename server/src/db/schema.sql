CREATE DATABASE IF NOT EXISTS auralis;
USE auralis;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(128) PRIMARY KEY,
  cognito_sub VARCHAR(128) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  avatar_url TEXT,
  storage_used_bytes BIGINT DEFAULT 0,
  storage_limit_bytes BIGINT DEFAULT 137438953472,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS photos (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  storage_key TEXT NOT NULL,
  thumbnail_key TEXT,
  width INT,
  height INT,
  captured_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location VARCHAR(255),
  camera VARCHAR(255),
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  file_size BIGINT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS albums (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_photo_id VARCHAR(128),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS album_photos (
  album_id VARCHAR(128) NOT NULL,
  photo_id VARCHAR(128) NOT NULL,
  PRIMARY KEY (album_id, photo_id),
  FOREIGN KEY (album_id) REFERENCES albums(id),
  FOREIGN KEY (photo_id) REFERENCES photos(id)
);

CREATE TABLE IF NOT EXISTS photo_tags (
  photo_id VARCHAR(128) NOT NULL,
  tag VARCHAR(80) NOT NULL,
  PRIMARY KEY (photo_id, tag),
  FOREIGN KEY (photo_id) REFERENCES photos(id)
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id VARCHAR(128) PRIMARY KEY,
  theme VARCHAR(50) DEFAULT 'system',
  gallery_density VARCHAR(50) DEFAULT 'comfortable',
  sort_order VARCHAR(50) DEFAULT 'newest',
  language VARCHAR(50) DEFAULT 'en',
  default_album_id VARCHAR(128),
  upload_quality VARCHAR(50) DEFAULT 'high',
  FOREIGN KEY (user_id) REFERENCES users(id)
);
