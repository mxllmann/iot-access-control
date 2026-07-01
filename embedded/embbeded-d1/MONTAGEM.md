# Montagem — Wemos D1 R2

## Placa: LOLIN(WEMOS) D1 R2 & mini
## Arduino IDE: Board = "LOLIN(WEMOS) D1 R2 & mini", Baud = 9600

---

## Mapeamento de pinos

| Pino na placa | GPIO | Componente       | Seguro no boot? |
|---------------|------|------------------|-----------------|
| D2            | 16   | LED Verde        | Sim             |
| D3            | 5    | LED Vermelho     | Sim             |
| D4            | 4    | RC522 SDA (SS)   | Sim             |
| D5 (SCK)      | 14   | RC522 SCK        | Sim (SPI)       |
| D6 (MISO)     | 12   | RC522 MISO       | Sim (SPI)       |
| D7 (MOSI)     | 13   | RC522 MOSI       | Sim (SPI)       |
| D8            | 0    | Rele IN1         | Sim (pull-up)   |
| D9            | 2    | RC522 RST        | Sim (pull-up)   |

Pinos que NAO devem ser usados:
- D0 (RX), D1 (TX) — serial debug
- D10 (GPIO15) — pull-down interno causa problema com rele

---

## Passo a passo

### 1. Alimentacao na protoboard

```
3.3V da placa  -->  trilha + (vermelha)
GND da placa   -->  trilha - (azul)
```

### 2. LED Verde (D2)

```
D2 ---[resistor 220R]--- perna longa (+) LED verde --- perna curta (-) --- GND
```

### 3. LED Vermelho (D3)

```
D3 ---[resistor 220R]--- perna longa (+) LED vermelho --- perna curta (-) --- GND
```

### 4. Modulo Rele (fora da protoboard, jumpers)

```
D8   -->  IN1
5V   -->  VCC
GND  -->  GND
```

OBS: O rele pode clicar brevemente no boot (GPIO0 comeca HIGH).
Isso e normal e nao afeta o funcionamento.

### 5. Modulo RFID RC522 (fora da protoboard, jumpers)

```
D4        -->  SDA
D5 (SCK)  -->  SCK
D6 (MISO) -->  MISO
D7 (MOSI) -->  MOSI
D9        -->  RST
3.3V      -->  3.3V (NUNCA 5V!)
GND       -->  GND
IRQ       -->  (nao conectar)
```

---

## Esquema visual

```
                 +------------------+
            3V3--| Wemos D1 R2      |--5V --> Rele VCC
            GND--|     (USB abaixo) |--GND
                 |                  |
  LED verde--D2--|                  |
  LED verm.--D3--|                  |
  RC522 SDA--D4--|                  |
  RC522 SCK--D5--|                  |
  RC522MISO--D6--|                  |
  RC522MOSI--D7--|                  |
   Rele IN1--D8--|                  |
  RC522 RST--D9--|                  |
     (livre)-D10-|  (NAO USAR)     |
                 +------------------+
```

---

## Ordem de montagem recomendada

Conecte um componente por vez e aperte RESET entre cada passo
para confirmar que a placa continua bootando:

1. Placa sozinha na protoboard (so alimentacao)
2. LED Verde (D2)
3. LED Vermelho (D3)
4. Rele (D8, 5V, GND)
5. RC522 (D4, D5, D6, D7, D9, 3.3V, GND)

---

## Upload do codigo

Se der erro "Failed to connect":
1. Desconecte o fio de D8 (rele)
2. Segure RESET, clique Upload, solte RESET ao ver "Connecting..."
3. Reconecte o fio apos o upload
4. Upload Speed: 115200

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
- LED verde + rele ligam por 2s
- Serial Monitor mostra o UID
