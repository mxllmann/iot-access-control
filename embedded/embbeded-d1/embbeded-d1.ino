#include <SPI.h>
#include <MFRC522.h>

// ============================================================
// Wemos D1 R2 (formato Arduino UNO) — Mapeamento de pinos
//
// Os labels na placa (D0-D15) NAO correspondem aos defines
// Dx do NodeMCU. Usamos GPIO direto.
//
// PINOS SEGUROS (sem restricao de boot):
//   D2 (GPIO16)  — LED Verde
//   D3 (GPIO5)   — LED Vermelho
//   D4 (GPIO4)   — RC522 SDA
//
// PINOS DE BOOT (cuidado):
//   D8  (GPIO0)  — Rele       (pull-up interno = HIGH no boot, OK)
//   D9  (GPIO2)  — RC522 RST  (pull-up interno, OK)
//
// SPI (fixo no hardware):
//   D5  (GPIO14) — SCK
//   D6  (GPIO12) — MISO
//   D7  (GPIO13) — MOSI
//
// LIVRE: D10 (GPIO15) — NAO USAR (pull-down, causa problema)
// ============================================================

#define LED_GREEN 16   // placa: D2
#define LED_RED    5   // placa: D3
#define RFID_SDA   4   // placa: D4
#define RFID_RST   2   // placa: D9
#define RELAY      0   // placa: D8

MFRC522 rfid(RFID_SDA, RFID_RST);

void setup() {
  delay(2000);
  Serial.begin(9600);
  Serial.println("\n=== Controle de Acesso — POC Wemos D1 R2 ===\n");

  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(RELAY, OUTPUT);

  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, LOW);
  digitalWrite(RELAY, LOW);

  // Teste rapido dos LEDs e rele
  Serial.println("Testando LED verde...");
  digitalWrite(LED_GREEN, HIGH);
  delay(500);
  digitalWrite(LED_GREEN, LOW);

  Serial.println("Testando LED vermelho...");
  digitalWrite(LED_RED, HIGH);
  delay(500);
  digitalWrite(LED_RED, LOW);

  Serial.println("Testando rele...");
  digitalWrite(RELAY, HIGH);
  delay(500);
  digitalWrite(RELAY, LOW);

  Serial.println("Componentes OK!\n");

  SPI.begin();
  rfid.PCD_Init();

  byte version = rfid.PCD_ReadRegister(rfid.VersionReg);
  Serial.print("RC522 firmware: 0x");
  Serial.println(version, HEX);

  if (version == 0x00 || version == 0xFF) {
    Serial.println("ERRO: RC522 nao detectado! Verifique as conexoes.");
    while (true) {
      digitalWrite(LED_RED, HIGH);
      delay(300);
      digitalWrite(LED_RED, LOW);
      delay(300);
    }
  }

  Serial.println("RC522 detectado!");
  Serial.println("Aproxime um cartao...\n");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return;
  }

  Serial.print("UID: ");
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      Serial.print("0");
      uid += "0";
    }
    Serial.print(rfid.uid.uidByte[i], HEX);
    uid += String(rfid.uid.uidByte[i], HEX);
    if (i < rfid.uid.size - 1) {
      Serial.print(":");
      uid += ":";
    }
  }
  Serial.println();
  Serial.print("Tipo: ");
  Serial.println(rfid.PICC_GetTypeName(rfid.PICC_GetType(rfid.uid.sak)));

  // Feedback: LED verde + rele por 2s
  digitalWrite(LED_GREEN, HIGH);
  digitalWrite(RELAY, HIGH);
  delay(2000);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(RELAY, LOW);

  Serial.println("Aproxime outro cartao...\n");

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}
