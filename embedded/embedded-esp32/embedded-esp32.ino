#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// ============ CONFIGURACAO ============
const char* WIFI_SSID     = "Wsforever";
const char* WIFI_PASSWORD = "wsforever201";
const char* API_BASE      = "https://ce79-179-181-81-14.ngrok-free.app/control";
// ======================================

// ============================================================
// ESP32 DevKit (ESP-WROOM-32) — Mapeamento de pinos
//
// SPI padrao do ESP32 (VSPI):
//   GPIO18 — SCK
//   GPIO19 — MISO
//   GPIO23 — MOSI
//
// Pinos livres usados:
//   GPIO5  — RC522 SDA (SS)
//   GPIO17 — RC522 RST
//   GPIO2  — LED Verde (LED onboard em alguns devkits)
//   GPIO4  — LED Vermelho
//   GPIO16 — Rele IN1
// ============================================================

#define LED_GREEN  2
#define LED_RED    4
#define RELAY     16
#define RFID_SDA   5
#define RFID_RST  17

MFRC522 rfid(RFID_SDA, RFID_RST);

void connectWiFi() {
  Serial.print("Conectando ao WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Conectado! IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("Heap livre: ");
    Serial.println(ESP.getFreeHeap());
  } else {
    Serial.println("ERRO: Nao conectou ao WiFi. Continuando offline...");
  }
}

void setup() {
  delay(1000);
  Serial.begin(115200);
  Serial.println("\n=== Controle de Acesso — ESP32 ===\n");

  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(RELAY, OUTPUT);

  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, LOW);
  digitalWrite(RELAY, LOW);

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

  connectWiFi();

  // Testa conexao com a API
  if (WiFi.status() == WL_CONNECTED) {
    testApiConnection();
  }

  SPI.begin();
  rfid.PCD_Init();

  byte version = rfid.PCD_ReadRegister(rfid.VersionReg);
  Serial.print("RC522 firmware: 0x");
  Serial.println(version, HEX);

  if (version == 0x00 || version == 0xFF) {
    Serial.println("ERRO: RC522 nao detectado!");
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

String readCardUID() {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
    if (i < rfid.uid.size - 1) uid += ":";
  }
  return uid;
}

bool ensureWiFi() {
  if (WiFi.status() == WL_CONNECTED) return true;
  Serial.println("WiFi desconectado, reconectando...");
  connectWiFi();
  return WiFi.status() == WL_CONNECTED;
}

// Helper GET
int doGet(const String& url, String& response) {
  if (!ensureWiFi()) return -1;

  HTTPClient http;
  WiFiClientSecure client;
  client.setInsecure();

  http.begin(client, url);
  int code = http.GET();
  if (code > 0) {
    response = http.getString();
  } else {
    Serial.print("Erro HTTP GET: ");
    Serial.println(http.errorToString(code));
    response = "";
  }
  http.end();
  return code;
}

// Helper POST
int doPost(const String& url, const String& body, String& response) {
  if (!ensureWiFi()) return -1;

  HTTPClient http;
  WiFiClientSecure client;
  client.setInsecure();

  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");

  int code = http.POST(body);
  if (code > 0) {
    response = http.getString();
  } else {
    Serial.print("Erro HTTP POST: ");
    Serial.println(http.errorToString(code));
    response = "";
  }
  http.end();
  return code;
}

// Testa conexao com a API via GET /health
bool testApiConnection() {
  Serial.println("Testando conexao com a API...");
  String url = String(API_BASE) + "/health";
  String resp;
  int code = doGet(url, resp);

  if (code == 200) {
    Serial.print("API OK: "); Serial.println(resp);
    return true;
  }

  Serial.print("API FALHOU (code="); Serial.print(code); Serial.println(")");
  if (resp.length() > 0) { Serial.print("Resp: "); Serial.println(resp); }
  return false;
}

// Verifica se o modo enrollment esta ativo na API
bool isEnrollmentActive() {
  String url = String(API_BASE) + "/credentials/enrollment";
  String resp;
  int code = doGet(url, resp);

  if (code <= 0) return false;

  Serial.print("Enrollment state: "); Serial.println(resp);
  return resp.indexOf("\"enabled\":true") >= 0
      && resp.indexOf("\"status\":\"waiting_credential\"") >= 0;
}

// Verifica acesso: POST /control/access
// Retorna: 0=erro, 1=autorizado, 2=negado
int checkAccess(const String& uid) {
  String url = String(API_BASE) + "/access";
  String body = "{\"credentialUid\":\"" + uid + "\"}";
  Serial.print("POST /access -> "); Serial.println(body);

  String resp;
  int code = doPost(url, body, resp);

  if (code <= 0) return 0;

  Serial.print("Resposta ("); Serial.print(code); Serial.print("): "); Serial.println(resp);
  if (resp.indexOf("\"authorized\":true") >= 0) return 1;
  return 2;
}

// Enrollment: POST /control/credentials/enrollment/read
bool enrollCard(const String& uid) {
  String url = String(API_BASE) + "/credentials/enrollment/read";
  String body = "{\"uid\":\"" + uid + "\"}";
  Serial.print("Enrollment -> "); Serial.println(body);

  String resp;
  int code = doPost(url, body, resp);

  if (code <= 0) return false;

  Serial.print("Resposta ("); Serial.print(code); Serial.print("): "); Serial.println(resp);
  return resp.indexOf("\"status\":\"success\"") >= 0;
}

void accessGranted() {
  Serial.println("ACESSO AUTORIZADO");
  digitalWrite(LED_GREEN, HIGH);
  digitalWrite(RELAY, HIGH);
  delay(3000);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(RELAY, LOW);
}

void accessDenied() {
  Serial.println("ACESSO NEGADO");
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_RED, HIGH);
    delay(300);
    digitalWrite(LED_RED, LOW);
    delay(200);
  }
}

void enrollmentSuccess() {
  Serial.println("CARTAO CADASTRADO!");
  for (int i = 0; i < 2; i++) {
    digitalWrite(LED_GREEN, HIGH);
    delay(200);
    digitalWrite(LED_GREEN, LOW);
    delay(200);
  }
}

void enrollmentFailed() {
  Serial.println("ERRO NO CADASTRO");
  digitalWrite(LED_RED, HIGH);
  digitalWrite(LED_GREEN, HIGH);
  delay(1000);
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_GREEN, LOW);
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return;
  }

  String uid = readCardUID();
  Serial.print("UID: ");
  Serial.println(uid);

  // Consulta a API para saber o modo atual
  if (isEnrollmentActive()) {
    // Modo enrollment — cadastra o cartao
    Serial.println("Modo ENROLLMENT ativo");
    if (enrollCard(uid)) {
      enrollmentSuccess();
    } else {
      enrollmentFailed();
    }
  } else {
    // Modo normal — verifica acesso
    int result = checkAccess(uid);
    if (result == 1) {
      accessGranted();
    } else {
      accessDenied();
    }
  }

  Serial.println("Aproxime outro cartao...\n");

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}
