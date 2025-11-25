# HogarPlan Web App

## Descripción del Proyecto

HogarPlan es una aplicación web diseñada para simular y comparar créditos hipotecarios en Perú, enfocándose en el Nuevo Crédito MIVIVIENDA con opción de aplicar al Bono de Techo Propio. Desarrollada desde la perspectiva de una empresa inmobiliaria, la aplicación permite a los usuarios (agentes inmobiliarios) gestionar información de clientes e inmuebles, realizar simulaciones financieras detalladas y obtener indicadores clave como la TCEA, VAN y TIR.

El sistema está diseñado para ser una herramienta transparente y eficiente para la venta de unidades de vivienda, ajustándose a los requerimientos de las entidades financieras autorizadas y la normativa peruana.

## Características Principales

*   **Autenticación de Usuarios**: Sistema seguro de registro e inicio de sesión con JWT (JSON Web Tokens) para proteger el acceso a la aplicación. Las sesiones se gestionan con `sessionStorage` para mayor seguridad y control.
*   **Gestión de Clientes (CRUD)**:
    *   Registro y visualización de información socioeconómica de clientes.
    *   Funcionalidades completas para Crear, Leer, Actualizar y Eliminar clientes.
    *   Formularios robustos con validación de datos.
    *   Búsqueda y filtrado de clientes por nombre, apellido, DNI o email.
*   **Gestión de Inmuebles (CRUD)**:
    *   Registro y visualización de características de la oferta inmobiliaria.
    *   Funcionalidades completas para Crear, Leer, Actualizar y Eliminar inmuebles.
    *   Formularios robustos con validación de datos.
    *   Búsqueda y filtrado de inmuebles por nombre de proyecto, dirección o tipo.
*   **Simulación de Créditos Hipotecarios**:
    *   **Cálculo Financiero Avanzado**: Implementación del Método Francés Vencido Ordinario.
    *   **Parámetros Flexibles**: Soporte para monedas (Soles/Dólares), tasas de interés nominales o efectivas (TNA/TEA) con diferentes periodos de capitalización.
    *   **Periodos de Gracia**: Consideración de periodos de gracia total o parcial.
    *   **Bonos**: Aplicación del Bono de Techo Propio.
    *   **Seguros**: Inclusión de seguros de desgravamen y de inmueble en el cálculo de cuotas.
    *   **Indicadores Financieros**: Cálculo automático de TCEA (Tasa de Costo Efectivo Anual), VAN (Valor Actual Neto) y TIR (Tasa Interna de Retorno) del préstamo.
    *   **Plan de Pagos Detallado**: Generación de un cronograma de pagos completo por cuota.
*   **Visualización de Simulaciones**:
    *   Listado de simulaciones guardadas con búsqueda y filtrado.
    *   Vista detallada de cada simulación, mostrando parámetros de entrada, resultados clave (Cuota, TCEA, VAN, TIR) y un resumen del plan de pagos.
    *   Opción de ver el plan de pagos completo en un modal interactivo.
    *   Funcionalidades para Editar y Eliminar simulaciones existentes.
*   **Exportación de Datos**:
    *   Capacidad de exportar el plan de pagos completo de una simulación a un archivo Excel (`.xlsx`).
*   **Secciones en Desarrollo**: Estructura para futuras funcionalidades como "Reportes" y "Transparencia SBS".

## Tecnologías Utilizadas

### Frontend
*   **React**: Biblioteca JavaScript para construir interfaces de usuario.
*   **TypeScript**: Superconjunto de JavaScript que añade tipado estático.
*   **Vite**: Herramienta de construcción rápida para proyectos web.
*   **Tailwind CSS**: Framework CSS para un diseño rápido y responsivo.
*   **shadcn/ui**: Colección de componentes UI construidos con Radix UI y Tailwind CSS.
*   **Lucide React**: Librería de iconos.
*   **XLSX**: Librería para leer y escribir archivos Excel.
*   **File-Saver**: Librería para guardar archivos generados en el cliente.

### Backend
*   **Node.js**: Entorno de ejecución de JavaScript.
*   **Express**: Framework web para Node.js.
*   **MongoDB**: Base de datos NoSQL.
*   **Mongoose**: ODM (Object Data Modeling) para MongoDB y Node.js.
*   **bcryptjs**: Librería para el hashing de contraseñas.
*   **jsonwebtoken**: Implementación de JSON Web Tokens para autenticación.
*   **cors**: Middleware para habilitar Cross-Origin Resource Sharing.

## Configuración e Instalación

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

### Requisitos Previos

*   **Node.js** (versión 18 o superior)
*   **npm** (viene con Node.js)
*   **MongoDB**: Asegúrate de tener una instancia de MongoDB ejecutándose (localmente o en la nube). Si lo ejecutas localmente, el backend intentará conectarse a `mongodb://localhost:27017/hogarplan`. Puedes usar MongoDB Community Server y MongoDB Compass para gestionarlo.

### 1. Clonar el Repositorio

### 2. Configurar el Backend (Carpeta `server`)

**Iniciar el servidor de Backend:**

El servidor se ejecutará en `http://localhost:3001`. Deberías ver `MongoDB connected successfully.` en la consola.

### 3. Configurar el Frontend (Carpeta Raíz del Proyecto)


**Iniciar el servidor de Desarrollo del Frontend:**

El frontend se ejecutará en `http://localhost:3000` 

## Uso de la Aplicación

1.  **Accede a la Aplicación**: Abre tu navegador y ve a `http://localhost:3000`.
2.  **Registro**: Si es tu primera vez, regístrate con un nuevo usuario y contraseña.
3.  **Inicio de Sesión**: Inicia sesión con tus credenciales.
4.  **Gestión de Clientes e Inmuebles**:
    *   Navega a las secciones "Clientes" e "Inmuebles" desde la barra lateral.
    *   Utiliza los botones "Añadir Cliente/Inmueble" para crear nuevos registros.
    *   Usa los iconos de lápiz para editar y los iconos de papelera para eliminar.
    *   Prueba la barra de búsqueda para filtrar los listados.
5.  **Crear Simulaciones**:
    *   Ve a la sección "Nueva Simulación".
    *   Selecciona un cliente y un inmueble existentes.
    *   Introduce todos los parámetros financieros (monto, plazo, tasas, seguros, periodos de gracia, bonos).
    *   Haz clic en "Calcular y Guardar Simulación".
6.  **Ver y Gestionar Simulaciones**:
    *   Navega a la sección "Simulaciones".
    *   Verás una lista de tus simulaciones. Haz clic en una para ver sus detalles.
    *   Desde el detalle, puedes "Editar Simulación" (te llevará al formulario precargado) o "Ver Plan de Pagos Completo" en un modal.
    *   Usa el botón "Exportar a Excel" para descargar el plan de pagos.
    *   Elimina simulaciones con el icono de papelera.
7.  **Cerrar Sesión**: Haz clic en el icono de usuario en la esquina superior derecha y selecciona "Cerrar sesión".

## Futuras Mejoras (Opcional)

*   **Gráficos y Visualizaciones**: Integrar librerías de gráficos (ej. Recharts) para visualizar el plan de pagos y otros indicadores.
*   **Exportación a PDF**: Añadir la opción de exportar reportes y planes de pago a PDF.
*   **Reportes Avanzados**: Desarrollar la lógica para los diferentes tipos de reportes en la sección "Reportes".
*   **Transparencia SBS**: Implementar la funcionalidad específica para la sección "Transparencia SBS".
*   **Notificaciones**: Mejorar el sistema de notificaciones.
*   **Perfil de Usuario**: Permitir a los usuarios ver y editar su información de perfil.
*   **Optimización de Rendimiento**: Mejorar el rendimiento de las tablas de plan de pagos para un gran número de cuotas.
