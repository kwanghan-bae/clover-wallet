package com.wallet.clover.api.architecture

import com.tngtech.archunit.core.importer.ImportOption
import com.tngtech.archunit.junit.AnalyzeClasses
import com.tngtech.archunit.junit.ArchTest
import com.tngtech.archunit.lang.ArchRule
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes
import com.tngtech.archunit.library.Architectures.layeredArchitecture

@AnalyzeClasses(packages = ["com.wallet.clover.api"], importOptions = [ImportOption.DoNotIncludeTests::class])
class ArchitectureTest {

    @ArchTest
    val layeredArchitectureRule: ArchRule = layeredArchitecture()
        .consideringAllDependencies()
        .layer("Controller").definedBy("..controller..")
        .layer("Service").definedBy("..service..")
        .layer("Repository").definedBy("..repository..")
        .layer("Client").definedBy("..client..")
        .layer("Scheduler").definedBy("..scheduler..")
        .whereLayer("Controller").mayNotBeAccessedByAnyLayer()
        .whereLayer("Service").mayOnlyBeAccessedByLayers("Controller", "Service", "Scheduler")
        .whereLayer("Repository").mayOnlyBeAccessedByLayers("Service")
        .whereLayer("Client").mayOnlyBeAccessedByLayers("Service")
        .whereLayer("Scheduler").mayNotBeAccessedByAnyLayer()

    /*
    @ArchTest
    val dtoShouldBeInDtoPackage: ArchRule = classes()
        .that().areTopLevelClasses()
        .and().haveSimpleNameEndingWith("Request")
        .or().haveSimpleNameEndingWith("Response")
        .should().resideInAPackage("..dto..")
        .orShould().resideInAPackage("..client..")
        .orShould().resideInAPackage("..common..")
        .orShould().resideInAPackage("..controller..")

    @ArchTest
    val controllerShouldNameEndingWithController: ArchRule = classes()
        .that().resideInAPackage("..controller..")
        .and().haveSimpleNameNotContaining("$") // 내부 클래스 제외
        .should().haveSimpleNameEndingWith("Controller")

    @ArchTest
    val serviceShouldNameEndingWithService: ArchRule = classes()
        .that().resideInAPackage("..service..")
        .and().areAnnotatedWith(org.springframework.stereotype.Service::class.java)
        .should().haveSimpleNameEndingWith("Service")
        .orShould().haveSimpleNameEndingWith("Extractor")
        .orShould().haveSimpleNameEndingWith("Crawler")
        .orShould().haveSimpleNameEndingWith("Calculator")

    @ArchTest
    val requestResponseShouldBeNested: ArchRule = classes()
        .that().haveSimpleNameEndingWith("Request")
        .or().haveSimpleNameEndingWith("Response")
        .and().resideInAPackage("..dto..")
        .should().beNestedClasses()
        .orShould().haveSimpleName("UserSummary")
        .orShould().haveSimpleName("CommonResponse")
        .orShould().haveSimpleName("LottoResponse")
    */
}
