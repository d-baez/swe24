DROP DATABASE glasses;
CREATE DATABASE glasses;
USE glasses;
SET FOREIGN_KEY_CHECKS = 0;

-- Table structure for table categories
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  category_id int NOT NULL AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  PRIMARY KEY (category_id),
  UNIQUE KEY name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table products
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  product_id int NOT NULL AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  color varchar(50) DEFAULT NULL,
  shape varchar(50) DEFAULT NULL,
  image_url text,
  category_id int DEFAULT NULL,
  stock int NOT NULL,
  source_url text,
  keywords text,
  PRIMARY KEY (product_id),
  KEY category_id (category_id),
  CONSTRAINT products_ibfk_1 FOREIGN KEY (category_id) REFERENCES categories (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table users
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  user_id int NOT NULL AUTO_INCREMENT,
  username varchar(50) NOT NULL,
  password_hash varchar(255) NOT NULL,
  name varchar(100) DEFAULT NULL,
  email varchar(100) NOT NULL,
  phone varchar(20) DEFAULT NULL,
  shipping_address text,
  cart json DEFAULT NULL,
  is_manager tinyint(1) DEFAULT '0',
  PRIMARY KEY (user_id),
  UNIQUE KEY username (username),
  UNIQUE KEY email (email)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table discounts
DROP TABLE IF EXISTS discounts;
CREATE TABLE discounts (
  discount_id int NOT NULL AUTO_INCREMENT,
  code varchar(20) NOT NULL,
  discount_type enum('percentage','fixed') NOT NULL,
  discount_value decimal(5,2) NOT NULL,
  start_date date NOT NULL,
  expiration_date date NOT NULL,
  description text,
  PRIMARY KEY (discount_id),
  UNIQUE KEY code (code)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table orders
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
  order_id int NOT NULL AUTO_INCREMENT,
  user_id int DEFAULT NULL,
  order_number varchar(20) NOT NULL,
  final_price decimal(10,2) NOT NULL,
  tax_amount decimal(10,2) NOT NULL,
  discount_code varchar(20) DEFAULT NULL,
  status enum('Processed','Shipped','Delivered', 'Cancelled') DEFAULT 'Processed',
  shipping_address text NOT NULL,
  payment_method varchar(50) DEFAULT NULL,
  payment_status varchar(50) NOT NULL,
  paypal_capture_id varchar(255) DEFAULT NULL,
  order_date timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  discount_id int DEFAULT NULL,
  discounted_total decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (order_id),
  UNIQUE KEY order_number (order_number),
  KEY user_id (user_id),
  KEY discount_id (discount_id),
  CONSTRAINT orders_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id),
  CONSTRAINT orders_ibfk_2 FOREIGN KEY (discount_id) REFERENCES discounts (discount_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table order_items
DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
  order_item_id int NOT NULL AUTO_INCREMENT,
  order_id int NOT NULL,
  product_id int NOT NULL,
  quantity int NOT NULL,
  price_at_purchase decimal(10,2) NOT NULL,
  PRIMARY KEY (order_item_id),
  KEY order_id (order_id),
  KEY product_id (product_id),
  CONSTRAINT order_items_ibfk_1 FOREIGN KEY (order_id) REFERENCES orders (order_id),
  CONSTRAINT order_items_ibfk_2 FOREIGN KEY (product_id) REFERENCES products (product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table reviews
DROP TABLE IF EXISTS reviews;
CREATE TABLE reviews (
  review_id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  rating int DEFAULT NULL,
  comment text,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id),
  KEY user_id (user_id),
  CONSTRAINT reviews_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id),
  CONSTRAINT reviews_chk_1 CHECK ((rating between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
-- Test Data for categories
INSERT INTO categories (name)
VALUES 
  ('Glasses'), 
  ('Cases'), 
  ('Repair Kits');

-- Test Data for products
INSERT INTO products (name, description, price, color, shape, image_url, category_id, stock, source_url, keywords)
VALUES
  ('Classic Glasses', 'Timeless classic glasses for everyday wear.', 50.00, 'Black', 'Rectangle', 'https://example.com/classic.jpg', 1, 100, 'https://example.com/classic', 'classic, durable'),
  ('Sunglasses', 'UV-protected stylish sunglasses.', 75.00, 'Brown', 'Aviator', 'https://example.com/sunglasses.jpg', 1, 50, 'https://example.com/sunglasses', 'sunglasses, UV protection'),
  ('Glass Case', 'Protective case for your glasses.', 10.00, 'Blue', NULL, 'https://example.com/case.jpg', 2, 200, 'https://example.com/case', 'case, protective'),
  ('Repair Kit', 'Compact repair kit for glasses.', 15.00, 'Gray', NULL, 'https://example.com/repairkit.jpg', 3, 150, 'https://example.com/repairkit', 'repair, tools, glasses');

-- Test Data for users
INSERT INTO users (username, password_hash, name, email, phone, shipping_address, cart, is_manager)
VALUES
  ('john_doe', 'hashed_password1', 'John Doe', 'john@example.com', '1234567890', '123 Main St, Anytown', NULL, 0),
  ('admin_user', 'hashed_password2', 'Admin User', 'admin@example.com', '0987654321', '456 Elm St, Othertown', NULL, 1);

-- Test Data for discounts
INSERT INTO discounts (code, discount_type, discount_value, start_date, expiration_date, description)
VALUES
  ('SALE20', 'percentage', 20.00, '2024-01-01', '2024-12-31', '20% off all orders'),
  ('FIVE_OFF', 'fixed', 5.00, '2024-01-01', '2024-06-30', '$5 off orders above $50');

-- Test Data for orders
INSERT INTO orders (user_id, order_number, final_price, tax_amount, discount_code, status, shipping_address, payment_method, payment_status, discounted_total)
VALUES
  (1, 'ORD12345', 80.00, 5.00, 'SALE20', 'Processed', '123 Main St, Anytown', 'Credit Card', 'Paid', 75.00);

-- Test Data for order_items
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
VALUES
  (1, 1, 2, 50.00);

-- Test Data for reviews
INSERT INTO reviews (user_id, rating, comment)
VALUES
  (1, 5, 'Excellent quality glasses, very satisfied!'),
  (1, 4, 'The case is sturdy and fits perfectly.'),
  (2, 3, 'Repair kit is okay, but could have more tools.');