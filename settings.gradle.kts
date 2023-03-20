rootProject.name = "lotto-private-manager"

include(
    "app:internal-api",
    "domain",
    "infra:h2",
    "infra:external-web-adapter"
)
