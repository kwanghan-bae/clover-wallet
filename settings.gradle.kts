rootProject.name = "lotto-private-manager"

include(
    "app:internal-api",
    "domain",
    "infra:external-web-adapter",
    "infra:rdb"
)
