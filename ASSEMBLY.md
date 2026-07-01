# Montagem do Modulo Embarcado — Estado Atual

## Status: Teste de componentes concluido com sucesso

Todos os componentes foram conectados na protoboard e validados individualmente
atraves do sketch de teste (`embedded/embedded.ino`).

## Componentes Testados

| Componente | Pino | Status |
|---|---|---|
| LED Verde | D0 (GPIO16) | OK |
| LED Vermelho | D4 (GPIO2) | OK |
| Rele (1 canal) | D8 (GPIO15) | OK |

## Componente Descartado

| Componente | Motivo |
|---|---|
| Buzzer | Buzzer passivo incompativel — D0 (GPIO16) nao suporta PWM e pinos D3/D4 tem pull-up de boot |

## Componente Pendente

| Componente | Pinos | Status |
|---|---|---|
| RC522 (RFID) | D1, D2, D5, D6, D7 | Conectado, aguardando teste de software |

## Conexoes na Protoboard

### Alimentacao
- 3V3 do NodeMCU → trilha + (vermelha)
- GND do NodeMCU → trilha - (azul)

### LED Verde (acesso autorizado)
- D0 → resistor 220 ohms → perna longa (+) do LED → perna curta (-) → trilha - (GND)

### LED Vermelho (acesso negado)
- D4 → resistor 220 ohms → perna longa (+) do LED → perna curta (-) → trilha - (GND)

### Modulo Rele (HW-316, fora da protoboard)
- D8 → IN1
- Vin → VCC (5V)
- GND → trilha - (GND)

### Modulo RFID RC522 (fora da protoboard, jumpers macho-macho)
- D1 → RST
- D2 → SDA
- D5 → SCK
- D6 → MISO
- D7 → MOSI
- Trilha + (3V3) → 3.3V
- Trilha - (GND) → GND
- IRQ → nao conectado

## Esquema Visual

```
    trilha + ═══════════════════════════════  (3.3V)
    trilha - ═══════════════════════════════  (GND)

                 ┌──────────────┐
            3V3──┤   NodeMCU    ├──Vin ──→ Rele VCC
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
```

## Observacoes

- O cabo USB do kit era somente de carga (sem dados). Substituido por outro
  cabo micro-USB com suporte a dados
- Driver CH340 instalado no macOS para comunicacao serial com o NodeMCU
- Placa selecionada na Arduino IDE: NodeMCU 1.0 (ESP-12E Module)
- Pino D3 (GPIO0) mantido livre — interfere no boot/upload quando conectado
- Para fazer upload: desconectar fios de D4 e D8, ou remover NodeMCU da protoboard

## Proximo Passo

Implementar a leitura do cartao RFID via modulo RC522 (biblioteca MFRC522).
