# Controle de Acesso IoT com RFID

## Visao Geral

Sistema de controle de acesso baseado em leitura de cartoes RFID, utilizando ESP8266 (NodeMCU) como microcontrolador principal. O sistema identifica cartoes autorizados e aciona um rele (simulando uma fechadura eletrica), com feedback visual (LEDs).

## Componentes

| Componente | Modelo | Funcao |
|---|---|---|
| Microcontrolador | ESP8266 NodeMCU | Processamento + Wi-Fi |
| Leitor RFID | RC522 (MFRC522) | Leitura de cartoes/chaveiros 13.56MHz |
| Rele | Modulo 4 canais (usar 1) | Simular acionamento de fechadura |
| LED Verde | 5mm | Indicar acesso autorizado |
| LED Vermelho | 5mm | Indicar acesso negado |
| Resistores | 2x 220 ohms | Protecao dos LEDs |

## Pinagem

```
ESP8266 NodeMCU — Mapeamento de Pinos
=============================================

Pino NodeMCU   GPIO    Componente      Funcao
-----------    ----    ----------      ------
D0             GPIO16  LED Verde       Acesso autorizado
D1             GPIO5   RC522 RST       Reset do leitor
D2             GPIO4   RC522 SDA       Slave Select (SPI)
D3             GPIO0   (livre)         -
D4             GPIO2   LED Vermelho    Acesso negado
D5             GPIO14  RC522 SCK       Clock SPI
D6             GPIO12  RC522 MISO      Dados RC522 -> ESP
D7             GPIO13  RC522 MOSI      Dados ESP -> RC522
D8             GPIO15  Rele (IN1)      Aciona fechadura
TX             GPIO1   (livre)         Serial TX (debug)
RX             GPIO3   (livre)         Serial RX (debug)
3V3            -       RC522 VCC       Alimentacao 3.3V
Vin            -       Rele VCC        Alimentacao 5V
GND            -       Todos GND       Terra comum
```

## Diagrama de Conexoes

```
                         ┌──────────────────┐
                         │    ESP8266        │
                         │    NodeMCU        │
                         │                  │
  ┌─── RC522 ────────────┤                  ├──────────── Rele ──┐
  │                      │                  │             (IN1)  │
  │  SDA ──────── D2     │                  │  D8 ────── IN1    │
  │  SCK ──────── D5     │                  │  Vin ───── VCC    │
  │  MOSI ─────── D7     │                  │  GND ───── GND    │
  │  MISO ─────── D6     │                  │                   │
  │  RST ──────── D1     │                  │                   │
  │  3.3V ─────── 3V3    │                  │                   │
  │  GND ──────── GND    │                  │                   │
  │  IRQ ──(solto)       │                  │                   │
  └──────────────────────┤                  │                   │
                         │                  │                   │
       LED Verde         │                  │    LED Vermelho   │
    D0──[220R]──(+)──GND │                  │ D4──[220R]──(+)──GND
                         │     USB          │
                         └────────┘─────────┘
```

## Esquema na Protoboard

```
    trilha +  ═══════════════════════════════  (3.3V do NodeMCU)
    trilha -  ═══════════════════════════════  (GND do NodeMCU)

    (alimentacao 5V separada para o rele)
    Vin do NodeMCU ──→ VCC do Rele

                 ┌──────────────┐
            3V3──┤   NodeMCU    ├──Vin ─────────→ Rele VCC
            GND──┤    (USB↑)    ├──GND
   LED vrd── D0──┤              ├
   RC522  ── D1──┤              ├
   RC522  ── D2──┤              ├
             D3──┤              ├
   LED vrm── D4──┤              ├
   RC522  ── D5──┤              ├
   RC522  ── D6──┤              ├
   RC522  ── D7──┤              ├
   Rele   ── D8──┤              ├
                 └──────────────┘

    Area livre da protoboard:
    ┌─────────────────────────────────────────┐
    │  [R 220]──LED verde──GND (trilha -)     │
    │  [R 220]──LED vermelho──GND (trilha -)  │
    └─────────────────────────────────────────┘

    RC522: fora da protoboard (jumpers macho-macho)
    Rele:  fora da protoboard (jumpers macho-macho)
```

## Fluxo de Funcionamento

```
          ┌─────────────────┐
          │  Sistema inicia  │
          └────────┬─────────┘
                   │
          ┌────────▼─────────┐
          │  Aguarda cartao   │◄──────────────────┐
          │  proximo ao leitor│                    │
          └────────┬─────────┘                    │
                   │ cartao detectado              │
          ┌────────▼─────────┐                    │
          │  Le UID do cartao │                    │
          └────────┬─────────┘                    │
                   │                               │
          ┌────────▼─────────┐                    │
          │  UID esta na      │                    │
          │  lista autorizada?│                    │
          └──┬────────────┬──┘                    │
             │ SIM        │ NAO                    │
    ┌────────▼───┐   ┌────▼────────┐              │
    │LED verde ON│   │LED verm. ON │              │
    │Rele: aciona│   │Rele: nada   │              │
    │ (3 seg)    │   │             │              │
    └────────┬───┘   └──────┬──────┘              │
             │              │                      │
    ┌────────▼───┐          │                      │
    │LED verde   │          │                      │
    │  OFF       │          │                      │
    │Rele desliga│          │                      │
    └────────┬───┘          │                      │
             └──────┬───────┘                      │
                    └──────────────────────────────┘
```

## Feedbacks do Sistema

| Evento | LED Verde | LED Vermelho | Rele |
|---|---|---|---|
| Aguardando cartao | OFF | OFF | OFF |
| Acesso autorizado | ON (3s) | OFF | ON (3s) |
| Acesso negado | OFF | ON (2s) | OFF |

## Bibliotecas Necessarias (Arduino IDE)

| Biblioteca | Uso |
|---|---|
| `MFRC522` | Comunicacao com o leitor RC522 via SPI |
| `SPI` | Protocolo SPI (nativa) |

## Alimentacao

- **RC522**: 3.3V (do pino 3V3 do NodeMCU) — NUNCA ligar em 5V
- **Rele**: 5V (do pino Vin do NodeMCU, quando alimentado via USB)
- **LEDs**: 3.3V via GPIO com resistor de 220 ohms
- **NodeMCU**: alimentado via cabo USB (5V)

## Observacoes Importantes

1. O RC522 opera em **3.3V** — ligar em 5V danifica o modulo
2. O rele usa **5V** (Vin) mas o sinal de controle (IN1) aceita 3.3V
3. O pino **D8 (GPIO15)** deve estar LOW no boot — o rele em estado LOW (desligado) no inicio garante isso
4. O pino **D4 (GPIO2)** tem pull-up interno — LED vermelho nao interfere no boot
5. **TX e RX ficam livres** para debug via Serial Monitor durante desenvolvimento
6. O pino **D3 (GPIO0)** fica livre — nao conectar componentes nele pois interfere no boot/upload
