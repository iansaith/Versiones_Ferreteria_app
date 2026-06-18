DROP DATABASE IF EXISTS proyectof;
CREATE DATABASE proyectof;
USE proyectof;

-- ─── TABLAS ───────────────────────────────────────────────────────────────────
CREATE TABLE Categoria (
    idCategoria INT PRIMARY KEY AUTO_INCREMENT,
    Nombre_Categoria VARCHAR(50) NOT NULL UNIQUE,
    Descripcion VARCHAR(50),
    Simbologia VARCHAR(50)
);

CREATE TABLE Proveedor (
    idProveedor INT PRIMARY KEY AUTO_INCREMENT,
    Nombre_Proveedor VARCHAR(50) NOT NULL UNIQUE,
    Contacto VARCHAR(30)
);

CREATE TABLE Roles (
    idRoles INT PRIMARY KEY AUTO_INCREMENT,
    Nombre_Rol VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Usuarios (
    idUsuarios INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) UNIQUE,
    Roles_idRoles INT,
    Contrasena VARCHAR(255) NOT NULL,
    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (Roles_idRoles)
        REFERENCES Roles(idRoles)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE Producto (
    idProducto INT PRIMARY KEY AUTO_INCREMENT,
    Nombre_Producto VARCHAR(50) NOT NULL UNIQUE,
    Stock_Minimo INT NOT NULL CHECK (Stock_Minimo >= 0),
    ubicacion VARCHAR(50),
    price DECIMAL(10,2) DEFAULT 0,
    wholesalePrice DECIMAL(10,2) DEFAULT 0,
    profit DECIMAL(10,2) DEFAULT 0,
    Categoria_idCategoria INT,
    Proveedor_idProveedor INT,
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (Categoria_idCategoria)
        REFERENCES Categoria(idCategoria)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_producto_proveedor
        FOREIGN KEY (Proveedor_idProveedor)
        REFERENCES Proveedor(idProveedor)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE Alerta_stock (
    idAlerta_stock INT PRIMARY KEY AUTO_INCREMENT,
    Fecha_alerta DATETIME DEFAULT CURRENT_TIMESTAMP,
    Stock INT,
    Estado_alerta VARCHAR(20) DEFAULT 'Bajo',
    Producto_idProducto INT,
    CONSTRAINT chk_estado
        CHECK (Estado_alerta IN ('Bajo', 'Normal')),
    CONSTRAINT fk_alerta_producto
        FOREIGN KEY (Producto_idProducto)
        REFERENCES Producto(idProducto)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Movimiento_Inventario (
    idMovimiento_Inventario INT PRIMARY KEY AUTO_INCREMENT,
    Fecha_Movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
    Tipo_Movimiento VARCHAR(20) NOT NULL,
    Cantidad_Movimiento INT NOT NULL CHECK (Cantidad_Movimiento > 0),
    Usuarios_idUsuarios INT,
    Producto_idProducto INT,
    CONSTRAINT chk_tipo
        CHECK (Tipo_Movimiento IN ('Entrada', 'Salida')),
    CONSTRAINT fk_mov_usuario
        FOREIGN KEY (Usuarios_idUsuarios)
        REFERENCES Usuarios(idUsuarios)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_mov_producto
        FOREIGN KEY (Producto_idProducto)
        REFERENCES Producto(idProducto)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expiracion DATETIME NOT NULL
);



-- ─── DATOS INICIALES ──────────────────────────────────────────────────────────
INSERT INTO Categoria (Nombre_Categoria, Descripcion, Simbologia) VALUES
('Herramientas', 'Martillos, destornilladores, llaves', '🔨'),
('Ferretería', 'Tornillos, clavos, tuercas', '🔩'),
('Herramientas Eléctricas', 'Taladros, sierras, amoladoras', '⚡'),
('Pinturas', 'Pinturas, esmaltes, solventes', '🎨');

INSERT INTO Proveedor (Nombre_Proveedor, Contacto) VALUES
('Proveedor A', '32214224'),
('Proveedor B', '32323332'),
('Proveedor C', '31423132'),
('Proveedor D', '34534252');

INSERT INTO Roles (Nombre_Rol) VALUES
('Administrador'),
('Encargado del inventario');

INSERT INTO Producto (Nombre_Producto, Stock_Minimo, ubicacion, price, wholesalePrice, profit, Categoria_idCategoria, Proveedor_idProveedor) VALUES
('Martillo',       10, 'Estante 1', 45000,  35000,  10000, 1, 1),
('Clavos 2"',      30, 'Estante 2', 8000,   5000,   3000,  2, 2),
('Taladro',         5, 'Estante 1', 180000, 140000, 40000, 3, 3),
('Pintura Blanca', 10, 'Estante 3', 35000,  25000,  10000, 4, 4),
('Brocha',         15, 'Estante 3', 12000,  8000,   4000,  4, 4);

-- ─── STORED PROCEDURES ───────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS p_encriptar_password;
DELIMITER $$
CREATE PROCEDURE p_encriptar_password(
    IN p_password VARCHAR(255),
    OUT p_hash VARCHAR(255)
)
BEGIN
    DECLARE v_salt VARCHAR(64);
    SET v_salt = UUID();
    SET p_hash = CONCAT(v_salt, ':', SHA2(CONCAT(p_password, v_salt), 256));
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_registrar_movimiento;
DELIMITER $$
CREATE PROCEDURE sp_registrar_movimiento(
    IN p_fecha DATETIME,
    IN p_tipo VARCHAR(20),
    IN p_cantidad INT,
    IN p_usuario INT,
    IN p_producto INT
)
BEGIN
    INSERT INTO Movimiento_Inventario
    (Fecha_Movimiento, Tipo_Movimiento, Cantidad_Movimiento, Usuarios_idUsuarios, Producto_idProducto)
    VALUES (p_fecha, p_tipo, p_cantidad, p_usuario, p_producto);
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_stock_producto;
DELIMITER $$
CREATE PROCEDURE sp_stock_producto(IN p_producto INT)
BEGIN
    SELECT
        p.Nombre_Producto,
        IFNULL(SUM(
            CASE
                WHEN m.Tipo_Movimiento = 'Entrada' THEN m.Cantidad_Movimiento
                WHEN m.Tipo_Movimiento = 'Salida' THEN -m.Cantidad_Movimiento
            END
        ),0) AS Stock_Actual
    FROM Producto p
    LEFT JOIN Movimiento_Inventario m ON p.idProducto = m.Producto_idProducto
    WHERE p.idProducto = p_producto
    GROUP BY p.Nombre_Producto;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_generar_alerta;
DELIMITER $$
CREATE PROCEDURE sp_generar_alerta(IN p_producto INT)
BEGIN
    DECLARE v_stock INT;
    DECLARE v_minimo INT;
    SELECT IFNULL(SUM(
        CASE
            WHEN Tipo_Movimiento = 'Entrada' THEN Cantidad_Movimiento
            WHEN Tipo_Movimiento = 'Salida' THEN -Cantidad_Movimiento
        END
    ),0) INTO v_stock
    FROM Movimiento_Inventario
    WHERE Producto_idProducto = p_producto;

    SELECT Stock_Minimo INTO v_minimo
    FROM Producto WHERE idProducto = p_producto;

    IF v_stock <= v_minimo THEN
        INSERT INTO Alerta_stock (Stock, Estado_alerta, Producto_idProducto)
        VALUES (v_stock, 'Bajo', p_producto);
    END IF;
END$$
DELIMITER ;




-- UPDATE Usuarios
-- SET Roles_idRoles = 1
-- WHERE Email = 'admin@ferreteria.com';