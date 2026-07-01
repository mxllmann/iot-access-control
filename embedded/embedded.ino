#include <SPI.h>
#include <MFRC522.h>

#define LED_GREEN D0
#define LED_RED   D4
#define RELAY     D8
#define RFID_SDA  D2
#define RFID_RST  D1

MFRC522 rfid(RFID_SDA, RFID_RST);

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== Controle de Acesso — Teste RFID ===\n");

  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(RELAY, OUTPUT);

  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, LOW);
  digitalWrite(RELAY, LOW);

  SPI.begin();
  rfid.PCD_Init();

  byte version = rfid.PCD_ReadRegister(rfid.VersionReg);
  Serial.print("RC522 versao do firmware: 0x");
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

  Serial.println("RC522 detectado com sucesso!");
  Serial.println("Aproxime um cartao ou chaveiro...\n");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return;
  }

  Serial.print("UID do cartao: ");
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

  // Feedback visual: pisca verde e aciona rele
  digitalWrite(LED_GREEN, HIGH);
  digitalWrite(RELAY, HIGH);
  delay(2000);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(RELAY, LOW);

  Serial.println("Aproxime outro cartao...\n");

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}
