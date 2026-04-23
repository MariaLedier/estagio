--coloque seu scrpit sql aqui!
CREATE TABLE tb_abastecimento (
    abastecimento_id INT AUTO_INCREMENT PRIMARY KEY,

    abastecimento_data DATE NOT NULL,
    abastecimento_km INT NOT NULL,
    abastecimento_litros DECIMAL(10,2) NOT NULL,
    abastecimento_valor DECIMAL(10,2) NOT NULL,

    abastecimento_tipo_combustivel VARCHAR(50),
    abastecimento_km_media DECIMAL(10,2),

    abastecimento_veiculo_id INT,
    abastecimento_usuario_id INT,

    abastecimento_pagamento VARCHAR(50),

    FOREIGN KEY (abastecimento_veiculo_id) REFERENCES tb_veiculos(veiculo_id),
    FOREIGN KEY (abastecimento_usuario_id) REFERENCES tb_usuario(usuario_id)
);

CREATE TABLE tb_descarte_pneu (
    descarte_pneu_id INT PRIMARY KEY,

    descarte_veiculo_id INT,
    descarte_posicao VARCHAR(20),

    descarte_data_entrada DATE,
    descarte_data_saida DATE,

    descarte_km_entrada INT,
    descarte_km_saida INT,
    descarte_km_uso INT,

    descarte_dias_uso INT,

    descarte_marca VARCHAR(100),
    descarte_medida VARCHAR(50),

    FOREIGN KEY (descarte_veiculo_id) REFERENCES tb_veiculos(veiculo_id)
);

CREATE TABLE tb_manutencao (
    manutencao_id INT AUTO_INCREMENT PRIMARY KEY,

    manutencao_tipo VARCHAR(50),
    manutencao_data DATE,
    manutencao_descricao TEXT,
    manutencao_status VARCHAR(30),
    manutencao_km INT,

    manutencao_veiculo_id INT,
    manutencao_usuario_id INT,

    FOREIGN KEY (manutencao_veiculo_id) REFERENCES tb_veiculos(veiculo_id),
    FOREIGN KEY (manutencao_usuario_id) REFERENCES tb_usuario(usuario_id)
);
CREATE TABLE tb_manutencao_item (
    item_id INT AUTO_INCREMENT PRIMARY KEY,

    item_descricao VARCHAR(255),
    item_valor DECIMAL(10,2),

    item_manutencao_id INT,
    item_servico_id INT,
    item_oficina_id INT,

    FOREIGN KEY (item_manutencao_id) REFERENCES tb_manutencao(manutencao_id) ON DELETE CASCADE,
    FOREIGN KEY (item_servico_id) REFERENCES tb_servico(servico_id),
    FOREIGN KEY (item_oficina_id) REFERENCES tb_oficina(oficina_id)
);

CREATE TABLE tb_marca (
    marca_id INT AUTO_INCREMENT PRIMARY KEY,
    marca_nome VARCHAR(100) NOT NULL
);


CREATE TABLE tb_modelo (
    modelo_id INT AUTO_INCREMENT PRIMARY KEY,
    modelo_nome VARCHAR(100) NOT NULL,

    modelo_marca_id INT NOT NULL,

    FOREIGN KEY (modelo_marca_id) REFERENCES tb_marca(marca_id)
);
CREATE TABLE tb_oficina (
    oficina_id INT AUTO_INCREMENT PRIMARY KEY,
    oficina_nome VARCHAR(150) NOT NULL,
    oficina_datacadastro DATE,
    oficina_cidade VARCHAR(100)
);
CREATE TABLE tb_pneus (
    pneus_id INT AUTO_INCREMENT PRIMARY KEY,

    pneus_marca VARCHAR(100),
    pneus_medida VARCHAR(50),
    pneus_data_aquisicao DATE,
    pneus_valor DECIMAL(10,2),

    pneus_estado VARCHAR(50),
    pneus_status VARCHAR(50),
    pneus_posicao VARCHAR(20),

    pneus_veiculo_id INT,

    FOREIGN KEY (pneus_veiculo_id) REFERENCES tb_veiculos(veiculo_id)
);

CREATE TABLE tb_servico (
    servico_id INT AUTO_INCREMENT PRIMARY KEY,
    servico_nome VARCHAR(150) NOT NULL
);

CREATE TABLE tb_usuario (
    usuario_id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_nome VARCHAR(100) NOT NULL,
    usuario_tipo VARCHAR(50),
    usuario_senha VARCHAR(255),

    usuario_ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE tb_veiculos (
    veiculo_id INT AUTO_INCREMENT PRIMARY KEY,

    veiculo_placa VARCHAR(10) NOT NULL,
    veiculo_ano INT,
    veiculo_renavam VARCHAR(20),
    veiculo_cor VARCHAR(50),

    veiculo_kmatual INT,
    veiculo_status VARCHAR(50),

    veiculo_modelo_id INT,
    veiculo_tanque DECIMAL(10,2),

    FOREIGN KEY (veiculo_modelo_id) REFERENCES tb_modelo(modelo_id)
);

INSERT INTO tb_marca (marca_nome) VALUES
('Volkswagen'),
('Fiat'),
('Chevrolet'),
('Ford'),
('Toyota'),
('Honda'),
('Hyundai'),
('Renault'),
('Nissan'),
('Jeep');

INSERT INTO tb_modelo (modelo_nome, modelo_marca_id) VALUES
-- Volkswagen
('Gol', 1),
('Voyage', 1),
('Saveiro', 1),

-- Fiat
('Uno', 2),
('Palio', 2),
('Strada', 2),
('Fiorino', 2),

-- Chevrolet
('Onix', 3),
('Prisma', 3),
('S10', 3),

-- Ford
('Ka', 4),
('Fiesta', 4),
('Ranger', 4),

-- Toyota
('Corolla', 5),
('Hilux', 5),

-- Honda
('Civic', 6),
('HR-V', 6),

-- Hyundai
('HB20', 7),
('Creta', 7),

-- Renault
('Kwid', 8),
('Duster', 8),

-- Nissan
('Versa', 9),
('Frontier', 9),

-- Jeep
('Renegade', 10),
('Compass', 10);

-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION — Sistema de Checklist de Frota
-- Banco: MySQL / MariaDB
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. CABEÇALHO DO CHECKLIST
CREATE TABLE IF NOT EXISTS tb_checklist (
    checklist_id          INT      NOT NULL AUTO_INCREMENT,
    checklist_data        DATE     NOT NULL,
    checklist_km          INT      NULL,
    checklist_observacoes TEXT     NULL,
    checklist_veiculo_id  INT      NOT NULL,
    checklist_usuario_id  INT      NOT NULL,
    checklist_criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (checklist_id),
    CONSTRAINT fk_checklist_veiculo FOREIGN KEY (checklist_veiculo_id) REFERENCES tb_veiculos (veiculo_id),
    CONSTRAINT fk_checklist_usuario FOREIGN KEY (checklist_usuario_id) REFERENCES tb_usuario  (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 2. ITENS DO CHECKLIST
--    Armazena TODOS os 33 campos inspecionados:
--
--    Motor & Fluidos : oleo, agua, fluido_freio, fluido_direcao, arrefecimento, correia
--    Freios          : freio_dianteiro, freio_traseiro, disco_dianteiro, disco_traseiro, freio_mao
--    Pneus           : pneu_dianteiro_esq, pneu_dianteiro_dir, pneu_traseiro_esq, pneu_traseiro_dir, estepe, calibragem
--    Elétrico        : bateria, farol_dianteiro, farol_traseiro, setas, luz_re, painel
--    Carroceria      : para_brisa, limpador, portas, espelhos, cinto, extintor, triangulo
--    Suspensão       : amortecedor_diant, amortecedor_tras, alinhamento, barra_direcao
--
--    item_status pode ser: "Bom" | "Regular" | "Ruim" | "Não verificado"

CREATE TABLE IF NOT EXISTS tb_checklist_item (
    item_id           INT         NOT NULL AUTO_INCREMENT,
    item_campo        VARCHAR(60) NOT NULL,
    item_status       VARCHAR(30) NOT NULL,
    item_checklist_id INT         NOT NULL,

    PRIMARY KEY (item_id),
    CONSTRAINT fk_item_checklist FOREIGN KEY (item_checklist_id)
        REFERENCES tb_checklist (checklist_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Nenhuma coluna adicionada em tb_veiculos.
-- Os 5 campos de pneu sincronizam pneu_estado em tb_pneu (via pneu_posicao + pneu_veiculo_id).
-- Os demais itens ficam apenas em tb_checklist_item para relatório e histórico.