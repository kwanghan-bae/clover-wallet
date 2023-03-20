package com.lotto.manager.internal

import com.lotto.manager.adapter.LoadLottoService
import org.springframework.beans.factory.InitializingBean
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class Init(
    val lottoService: LoadLottoService
) :InitializingBean{
    
    override fun afterPropertiesSet() {
        println(lottoService.loadByDrawDate(LocalDate.now()))
    }
}