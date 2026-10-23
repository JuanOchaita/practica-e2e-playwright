# Defectos encontrados

| Regla | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| Catálogo: ordenar por precio de menor a mayor y de mayor a menor para todos los usuarios | Iniciar sesión como `problema`; seleccionar `precio-asc` o `precio-desc` | Los seis productos se ordenan por precio | El catálogo conserva el orden original |
| Carrito: se agrega el producto seleccionado | Iniciar sesión como `problema`; agregar `Taza de barro` | El carrito contiene `Taza de barro` | El carrito contiene `Filtros de papel (100)` |
| Datos de envío: nombre, apellido y código postal son obligatorios | Iniciar sesión como `problema`; agregar un producto; completar nombre y código postal dejando vacío el apellido | Se muestra el error de apellido faltante | La aplicación ignora el apellido ingresado y siempre reporta que falta |
| Envío gratis: el cupón `ENVIOGRATIS` vale para cualquier código postal | Agregar un producto; usar `envioGratis` con espacios y código postal `10001` | El envío es `Q0.00` | El envío se cobra según el código postal |
