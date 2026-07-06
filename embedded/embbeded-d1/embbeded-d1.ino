#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>

// ============ CONFIGURACAO ============
const char* WIFI_SSID     = "Wsforever";
const char* WIFI_PASSWORD = "wsforever201";
const char* API_BASE      = "https://ce79-179-181-81-14.ngrok-free.app/control";
const char* API_KEY       = "iot-device-key";
// ======================================

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
#define RFID_RST  -1   // RST ligado direto no 3.3V (sem pino GPIO)
#define RELAY      0   // placa: D8

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

bool ensureWiFi() {
  if (WiFi.status() == WL_CONNECTED) return true;
  Serial.println("WiFi desconectado, reconectando...");
  connectWiFi();
  return WiFi.status() == WL_CONNECTED;
}

// Helper GET — D1 precisa de buffers reduzidos para HTTPS
int doGet(const String& url, String& response) {
  if (!ensureWiFi()) return -1;

  HTTPClient http;
  int code;

  if (String(API_BASE).startsWith("https")) {
    WiFiClientSecure client;
    client.setInsecure();
    client.setBufferSizes(4096, 512);
    client.setTimeout(15000);
    http.begin(client, url);
    http.addHeader("X-API-Key", API_KEY);
    code = http.GET();
  } else {
    WiFiClient client;
    http.begin(client, url);
    http.addHeader("X-API-Key", API_KEY);
    code = http.GET();
  }

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
  int code;

  if (String(API_BASE).startsWith("https")) {
    WiFiClientSecure client;
    client.setInsecure();
    client.setBufferSizes(4096, 512);
    client.setTimeout(15000);
    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-Key", API_KEY);
    code = http.POST(body);
  } else {
    WiFiClient client;
    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-Key", API_KEY);
    code = http.POST(body);
  }

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

void setup() {
  delay(2000);
  Serial.begin(9600);
  Serial.println("\n=== Controle de Acesso — Wemos D1 R2 ===\n");

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

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return;
  }

  String uid = readCardUID();
  Serial.print("UID: ");
  Serial.println(uid);

  // Consulta a API para saber o modo atual
  if (isEnrollmentActive()) {
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
