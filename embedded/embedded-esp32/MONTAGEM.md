# Montagem — ESP32 DevKit (ESP-WROOM-32)

## Arduino IDE
- Board: "ESP32 Dev Module" (instalar ESP32 pelo Boards Manager)
- Baud: 115200

---

## Mapeamento de pinos

Use os nomes escritos na placa. Onde nao existe `D`, use apenas o numero do pino.

| Pino na placa | No codigo | Componente       | Observacao          |
|---------------|-----------|------------------|---------------------|
| D2            | 2         | LED Verde        | LED onboard em alguns devkits |
| D4            | 4         | LED Vermelho     |                     |
| D5            | 5         | RC522 SDA (SS)   |                     |
| D27           | 27        | Rele IN1         | Seguro, sem restricao de boot |
| D22           | 22        | RC522 RST        | Pino digital para reset do RC522 |
| D18           | 18        | RC522 SCK        | SPI padrao (VSPI)   |
| D19           | 19        | RC522 MISO       | SPI padrao (VSPI)   |
| D23           | 23        | RC522 MOSI       | SPI padrao (VSPI)   |
| 3.3V          | -         | RC522 VCC        | NUNCA 5V!           |
| 5V/VIN        | -         | Rele VCC         |                     |
| GND           | -         | Todos GND        |                     |

---

## Passo a passo

### 1. Alimentacao na protoboard

```
3.3V do ESP32  -->  trilha + (vermelha)
GND do ESP32   -->  trilha - (azul)
```

### 2. LED Verde (D2)

```
D2 ---[resistor 220R]--- perna longa (+) LED verde --- perna curta (-) --- GND
```

### 3. LED Vermelho (D4)

```
D4 ---[resistor 220R]--- perna longa (+) LED vermelho --- perna curta (-) --- GND
```

### 4. Modulo Rele (fora da protoboard, jumpers)

```
D27    -->  IN1
5V/VIN -->  VCC
GND    -->  GND
```

### 5. Modulo RFID RC522 (fora da protoboard, jumpers)

```
D5     -->  SDA
D18    -->  SCK
D19    -->  MISO
D23    -->  MOSI
D22    -->  RST
3.3V   -->  3.3V (NUNCA 5V!)
GND    -->  GND
IRQ    -->  (nao conectar)
```

---

## Esquema visual

```
                 +------------------+
           3.3V--| ESP32 DevKit     |--5V/VIN --> Rele VCC
            GND--|                  |--GND
                 |                  |
  LED verde--D2--|                  |
  LED verm.--D4--|                  |
  RC522 SDA--D5--|                  |
  Rele IN1-D27---|                  |
  RC522 RST-D22--|                  |
  RC522 SCK-D18--|                  |
  RC522MISO-D19--|                  |
  RC522MOSI-D23--|                  |
                 +------------------+
```

---

## Ordem de montagem recomendada

1. ESP32 sozinho na protoboard (so alimentacao)
2. LED Verde (D2)
3. LED Vermelho (D4)
4. Rele (D27, 5V/VIN, GND)
5. RC522 (D5, D22, D18, D19, D23, 3.3V, GND)

---

## O que esperar

### No boot (automatico):
1. LED verde acende 0.5s
2. LED vermelho acende 0.5s
3. Rele clica 0.5s

### Depois do boot:
- RC522 nao detectado --> LED vermelho pisca sem parar
- RC522 detectado --> aguarda cartao

### Ao aproximar cartao:
- Autorizado --> LED verde + rele ligam por 3s
- Negado --> LED vermelho pisca 3x
- Cadastro OK --> LED verde pisca 2x rapido

---

## Vantagens sobre ESP8266/Wemos D1

- 520KB RAM (vs 80KB) — HTTPS funciona sem OOM
- Sem restricoes de pinos de boot
- Dual-core, Bluetooth
- Upload sem precisar desconectar fios
