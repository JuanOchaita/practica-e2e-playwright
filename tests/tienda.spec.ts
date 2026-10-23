import { test, expect } from "./fixtures";

const PRODUCT = "Café de Huehuetenango 250 g";
const TAZA = "Taza de barro";

test.describe("Ingreso y sesión", () => {
  test("Regla: usuario y contraseña obligatorios | Técnica: valores límite", async ({ login }) => {
    await login.goto();
    await login.login("");
    await login.expectError("Falta el usuario.");
    await login.login("estandar", "");
    await login.expectError("Falta la contraseña.");
  });

  test("Regla: usuario bloqueado no entra | Técnica: partición de equivalencia", async ({ login }) => {
    await login.goto();
    await login.login("bloqueado");
    await login.expectError("Este usuario está bloqueado.");
  });

  test("Regla: cerrar sesión vacía el carrito | Técnica: transición de estados", async ({ login, catalog, cart }) => {
    await login.goto();
    await login.login("estandar");
    await catalog.addProduct(PRODUCT);
    await catalog.logoutAndExpectLogin();
    await login.login("estandar");
    await catalog.openCart();
    await expect(cart.rows).toHaveCount(0);
  });

  test("Regla: usuario lento puede entrar sin espera fija | Técnica: transición de estados", async ({ login }) => {
    await login.goto();
    await login.login("lento");
    await expect(login.page).toHaveURL(/\/catalogo(?:\.html)?$/);
  });
});

test.describe("Catálogo y carrito", () => {
  test.beforeEach(async ({ login }) => {
    await login.goto();
    await login.login("estandar");
  });

  test("Regla: catálogo inicia ordenado por nombre A-Z | Técnica: partición de equivalencia", async ({ catalog }) => {
    await expect.poll(() => catalog.productNames()).toEqual([
      "Café de Antigua 500 g",
      "Café de Huehuetenango 250 g",
      "Filtros de papel (100)",
      "Molino manual",
      "Prensa francesa",
      "Taza de barro"
    ]);
  });

  test("Regla: ordenar por precio ascendente y descendente | Técnica: tabla de decisión", async ({ catalog }) => {
    await catalog.selectOrder("precio-asc");
    await expect.poll(() => catalog.prices()).toEqual(["Q25.00", "Q60.00", "Q75.00", "Q140.00", "Q225.00", "Q350.00"]);
    await catalog.selectOrder("precio-desc");
    await expect.poll(() => catalog.prices()).toEqual(["Q350.00", "Q225.00", "Q140.00", "Q75.00", "Q60.00", "Q25.00"]);
  });

  test("Regla: cada producto se agrega una vez y el contador suma unidades | Técnica: partición de equivalencia", async ({ catalog, cart }) => {
    await catalog.addProduct(PRODUCT);
    await expect(catalog.cartCount).toHaveText("1");
    await catalog.openCart();
    await expect(cart.row(PRODUCT)).toHaveCount(1);
    await cart.setQuantity(PRODUCT, "3");
    await expect(catalog.cartCount).toHaveText("3");
  });

  test("Regla: cantidad inválida no permite continuar | Técnica: análisis de valores límite", async ({ catalog, cart }) => {
    await catalog.addProduct(PRODUCT);
    await catalog.openCart();
    for (const invalidQuantity of ["0", "-1", "1.5", "6"]) {
      await cart.setQuantity(PRODUCT, invalidQuantity);
      await cart.expectQuantityError();
    }
    await expect(cart.continueButton).toBeDisabled();
  });

  test("Regla: agrega el producto seleccionado | Técnica: partición de equivalencia", async ({ catalog, cart }) => {
    await catalog.addProduct(TAZA);
    await catalog.openCart();
    await expect(cart.row(TAZA)).toHaveCount(1);
  });

  test("Regla: ordenar por precio también funciona para usuario problema | Técnica: partición de equivalencia", async ({ login, catalog }) => {
    await login.goto();
    await login.login("problema");
    await catalog.selectOrder("precio-asc");
    await expect.poll(() => catalog.prices()).toEqual(["Q25.00", "Q60.00", "Q75.00", "Q140.00", "Q225.00", "Q350.00"]);
  });

  test("Regla: el producto seleccionado se agrega para usuario problema | Técnica: partición de equivalencia", async ({ login, catalog, cart }) => {
    await login.goto();
    await login.login("problema");
    await catalog.addProduct(TAZA);
    await catalog.openCart();
    await expect(cart.row(TAZA)).toHaveCount(1);
  });
});

test.describe("Checkout y cálculo", () => {
  test("Regla: nombre, apellido y código postal obligatorios | Técnica: particiones de equivalencia", async ({ login, catalog, cart, checkout }) => {
    await login.goto();
    await login.login("estandar");
    await catalog.addProduct(PRODUCT);
    await catalog.openCart();
    await cart.continueToCheckout();
    await checkout.fillShipping("", "Pérez", "01001");
    await checkout.submit();
    await checkout.expectError("Falta el nombre.");
    await checkout.fillShipping("Ana", "", "01001");
    await checkout.submit();
    await checkout.expectError("Falta el apellido.");
    await checkout.fillShipping("Ana", "Pérez", "1001");
    await checkout.submit();
    await checkout.expectError("El código postal tiene que tener 5 dígitos.");
  });

  test("Regla: cupón válido ignora mayúsculas, minúsculas y espacios | Técnica: tabla de decisión", async ({ login, catalog, cart, checkout, summary }) => {
    await login.goto();
    await login.login("estandar");
    await catalog.addProduct(PRODUCT);
    await catalog.openCart();
    await cart.continueToCheckout();
    await checkout.fillShipping("Ana", "Pérez", "10001", " envioGratis ");
    await checkout.submit();
    await summary.expectAmounts("Q75.00", "-Q0.00", "Q0.00", "Q75.00");
  });

  test("Regla: cualquier cupón distinto de ENVIOGRATIS es inválido | Técnica: partición de equivalencia", async ({ login, catalog, cart, checkout }) => {
    await login.goto();
    await login.login("estandar");
    await catalog.addProduct(PRODUCT);
    await catalog.openCart();
    await cart.continueToCheckout();
    await checkout.fillShipping("Ana", "Pérez", "01001", "ENVIOGRATIS-extra");
    await checkout.submit();
    await checkout.expectError("El cupón no existe.");
  });

  test("Regla: los datos de envío se conservan para usuario problema | Técnica: transición de estados", async ({ login, catalog, cart, checkout }) => {
    await login.goto();
    await login.login("problema");
    await catalog.addProduct(PRODUCT);
    await catalog.openCart();
    await cart.continueToCheckout();
    await checkout.fillShipping("Ana", "Pérez", "01001");
    await checkout.submit();
    await expect(login.page).toHaveURL(/\/resumen(?:\.html)?$/);
  });

  test("Regla: descuento de 5% desde Q200 | Técnica: análisis de valores límite", async ({ login, catalog, cart, checkout, summary }) => {
    await login.goto();
    await login.login("estandar");
    await catalog.addProduct("Café de Antigua 500 g");
    await catalog.addProduct("Taza de barro");
    await catalog.openCart();
    await cart.continueToCheckout();
    await checkout.fillShipping("Ana", "Pérez", "01001");
    await checkout.submit();
    await summary.expectAmounts("Q200.00", "-Q10.00", "Q25.00", "Q215.00");
  });

  test("Regla: descuento de 10% desde Q500 y envío gratis desde Q300 | Técnica: análisis de valores límite", async ({ login, catalog, cart, checkout, summary }) => {
    await login.goto();
    await login.login("estandar");
    await catalog.addProduct("Molino manual");
    await catalog.addProduct("Café de Antigua 500 g");
    await catalog.addProduct(PRODUCT);
    await catalog.openCart();
    await cart.continueToCheckout();
    await checkout.fillShipping("Ana", "Pérez", "99000");
    await checkout.submit();
    await summary.expectAmounts("Q565.00", "-Q56.50", "Q0.00", "Q508.50");
  });

  test("Regla: confirmar genera pedido de 6 dígitos y vacía carrito | Técnica: transición de estados", async ({ login, catalog, cart, checkout, summary, confirmation }) => {
    await login.goto();
    await login.login("estandar");
    await catalog.addProduct(PRODUCT);
    await catalog.openCart();
    await cart.continueToCheckout();
    await checkout.fillShipping("Ana", "Pérez", "01001");
    await checkout.submit();
    await summary.confirm();
    await confirmation.expectOrderNumber();
    await catalog.page.goto("carrito.html");
    await expect(cart.rows).toHaveCount(0);
  });
});
