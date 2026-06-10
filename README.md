# PAwChO - Zadanie 2
## Autor

Mariia Flidermoiz


## Działanie aplikacji

Aplikacja umożliwia wybór kraju oraz miasta z listy, a następnie pobiera aktualne dane pogodowe z API Open-Meteo.

Użytkownik może sprawdzić pogodę dla wybranych miast w Polsce, Ukrainie oraz Niemczech.

Aplikacja wyświetla:

- temperaturę,
- wilgotność,
- prędkość wiatru,
- opis warunków pogodowych.

Dodatkowo aplikacja posiada endpoint kontrolny:

```text
/health
```

Endpoint zwraca odpowiedź:

```text
OK
```

## Uruchomienie aplikacji lokalnie

Instalacja zależności:

```bash
npm install
```

Uruchomienie aplikacji:

```bash
npm start
```

Po uruchomieniu aplikacja jest dostępna pod adresem:

```text
http://localhost:3000
```

## Budowanie obrazu Docker lokalnie

Obraz można zbudować poleceniem:

```bash
docker build -t zadanie1-weather-app:1.0 .
```

## Uruchomienie kontenera lokalnie

Kontener można uruchomić poleceniem:

```bash
docker run -d --name zadanie1-weather -p 3000:3000 zadanie1-weather-app:1.0
```

Po uruchomieniu aplikacja jest dostępna pod adresem:

```text
http://localhost:3000
```

Logi aplikacji można sprawdzić poleceniem:

```bash
docker logs zadanie1-weather
```

Przykładowe logi:

```text
Application started at: 2026-06-10T12:00:00.000Z
Author: Mariia Flidermoiz
Application listening on TCP port: 3000
```

## GitHub Actions

Pipeline GitHub Actions znajduje się w pliku:

```text
.github/workflows/docker-image.yml
```

Pipeline uruchamia się automatycznie po wykonaniu `push` do gałęzi:

```text
main
master
```

Można go również uruchomić ręcznie z poziomu zakładki GitHub Actions.

## Etapy pipeline

Pipeline wykonuje następujące kroki:

1. Pobranie kodu źródłowego z repozytorium.
2. Konfiguracja QEMU.
3. Konfiguracja Docker Buildx.
4. Logowanie do DockerHub.
5. Logowanie do GitHub Container Registry.
6. Zbudowanie lokalnego obrazu do testu CVE.
7. Skanowanie obrazu narzędziem Trivy.
8. Zbudowanie i wysłanie obrazu multi-platformowego do GHCR.

## Obsługiwane architektury

Obraz kontenera budowany jest dla dwóch architektur:

```text
linux/amd64
linux/arm64
```

Do obsługi wielu architektur wykorzystano Docker Buildx oraz QEMU.

## GitHub Container Registry

Gotowy obraz publikowany jest w GitHub Container Registry:

```text
ghcr.io/miraswqh/zadanie1-weather-app
```

Obraz jest wysyłany do GHCR tylko wtedy, gdy test CVE zakończy się powodzeniem.

## Schemat tagowania obrazów

Zastosowano dwa tagi obrazu:

```text
latest
sha-XXXXXXX
```

Tag `latest` oznacza najnowszą poprawnie zbudowaną wersję obrazu.

Tag `sha-XXXXXXX` zawiera pierwsze siedem znaków identyfikatora commita. Dzięki temu można jednoznacznie powiązać obraz kontenera z konkretną wersją kodu źródłowego.

Przykład:

```text
ghcr.io/miraswqh/zadanie1-weather-app:latest
ghcr.io/miraswqh/zadanie1-weather-app:sha-a1b2c3d
```

Takie tagowanie pozwala łatwo pobrać najnowszą wersję obrazu, a jednocześnie zachować możliwość odtworzenia konkretnej wersji aplikacji na podstawie commita.

## Cache Docker Buildx

W pipeline wykorzystano cache typu `registry`.

Cache przechowywany jest w publicznym repozytorium DockerHub:

```text
docker.io/101731/zadanie2-weather-app-cache:buildcache
```

W workflow zastosowano:

```text
cache-from: type=registry
cache-to: type=registry,mode=max
```

`cache-from` pozwala pobierać wcześniej zapisane dane cache, natomiast `cache-to` zapisuje nowe dane cache po poprawnym zbudowaniu obrazu.

Tryb `mode=max` zapisuje pełniejsze dane cache, co pozwala przyspieszyć kolejne budowania obrazu w GitHub Actions.

## Test CVE

Do testu CVE wykorzystano skaner Trivy.

Pipeline sprawdza obraz pod kątem podatności o poziomie:

```text
HIGH
CRITICAL
```

Jeżeli Trivy wykryje podatności sklasyfikowane jako wysokie lub krytyczne, pipeline kończy się błędem i obraz nie zostaje wysłany do GitHub Container Registry.

Dzięki temu obraz trafia do publicznego repozytorium GHCR tylko wtedy, gdy nie zawiera podatności `HIGH` lub `CRITICAL`.

## Trivy ignore

Podczas skanowania CVE wykorzystano plik `.trivyignore`, w którym wskazano konkretną podatność:

```text
CVE-2026-33671
```

## Secret GitHub Actions

W repozytorium skonfigurowano następujące sekrety:

```text
DOCKERHUB_TOKEN
GHCR_TOKEN
```

`DOCKERHUB_TOKEN` służy do logowania do DockerHub oraz obsługi cache budowania.

`GHCR_TOKEN` służy do logowania do GitHub Container Registry i publikacji obrazu.

Token GitHub użyty jako `GHCR_TOKEN` posiada uprawnienia:

```text
read:packages
write:packages
```

## DockerHub cache repository

Do przechowywania cache utworzono publiczne repozytorium DockerHub:

```text
101731/zadanie2-weather-app-cache
```

Cache jest zapisywany z tagiem:

```text
buildcache
```

Pełna nazwa cache:

```text
docker.io/101731/zadanie2-weather-app-cache:buildcache
```

## Uruchomienie pipeline

Pipeline uruchamia się automatycznie po wypchnięciu zmian do repozytorium:

```bash
git add .
git commit -m "Update project"
git push
```

Można go również uruchomić ręcznie:

```text
Actions → Build, scan and push Docker image → Run workflow
```

## Wynik działania

Po poprawnym wykonaniu workflow obraz zostaje:

1. zbudowany dla architektur `linux/amd64` oraz `linux/arm64`,
2. sprawdzony pod kątem CVE narzędziem Trivy,
3. opublikowany w GitHub Container Registry,
4. oznaczony tagami `latest` oraz `sha-XXXXXXX`.

## Link do obrazu

Obraz po poprawnym wykonaniu workflow jest dostępny pod adresem:

```text
ghcr.io/miraswqh/zadanie1-weather-app
```


