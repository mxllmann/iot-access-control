# Montagem — ESP32 DevKit (ESP-WROOM-32)

## Arduino IDE
- Board: "ESP32 Dev Module" (instalar ESP32 pelo Boards Manager)
- Baud: 115200

---

## Mapeamento de pinos

| GPIO | Componente       | Observacao          |
|------|------------------|---------------------|
| 2    | LED Verde        | LED onboard em alguns devkits |
| 4    | LED Vermelho     |                     |
| 5    | RC522 SDA (SS)   |                     |
| 16   | Rele IN1         | Seguro, sem restricao de boot |
| 17   | RC522 RST        |                     |
| 18   | RC522 SCK        | SPI padrao (VSPI)   |
| 19   | RC522 MISO       | SPI padrao (VSPI)   |
| 23   | RC522 MOSI       | SPI padrao (VSPI)   |
| 3.3V | RC522 VCC        | NUNCA 5V!           |
| 5V/VIN | Rele VCC       |                     |
| GND  | Todos GND        |                     |

---

## Passo a passo

### 1. Alimentacao na protoboard

```
3.3V do ESP32  -->  trilha + (vermelha)
GND do ESP32   -->  trilha - (azul)
```

### 2. LED Verde (GPIO 2)

```
GPIO2 ---[resistor 220R]--- perna longa (+) LED verde --- perna curta (-) --- GND
```

### 3. LED Vermelho (GPIO 4)

```
GPIO4 ---[resistor 220R]--- perna longa (+) LED vermelho --- perna curta (-) --- GND
```

### 4. Modulo Rele (fora da protoboard, jumpers)

```
GPIO16 -->  IN1
5V/VIN -->  VCC
GND    -->  GND
```

### 5. Modulo RFID RC522 (fora da protoboard, jumpers)

```
GPIO5  -->  SDA
GPIO18 -->  SCK
GPIO19 -->  MISO
GPIO23 -->  MOSI
GPIO17 -->  RST
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
  LED verde--G2--|                  |
  LED verm.--G4--|                  |
  RC522 SDA--G5--|                  |
  Rele IN1--G16--|                  |
  RC522 RST-G17--|                  |
  RC522 SCK-G18--|                  |
  RC522MISO-G19--|                  |
  RC522MOSI-G23--|                  |
                 +------------------+
```

---

## Ordem de montagem recomendada

1. ESP32 sozinho na protoboard (so alimentacao)
2. LED Verde (GPIO 2)
3. LED Vermelho (GPIO 4)
4. Rele (GPIO 16, 5V, GND)
5. RC522 (GPIO 5, 17, 18, 19, 23, 3.3V, GND)

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
