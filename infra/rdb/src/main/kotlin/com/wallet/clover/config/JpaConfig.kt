package com.wallet.clover.config

import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import javax.sql.DataSource


@Configuration
@EnableJpaRepositories(basePackages = ["com.wallet.clover"])
@EntityScan("com.wallet.clover")
class JpaConfig(
    val datasource: DataSource,
) {
}
