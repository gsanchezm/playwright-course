# 3. ¿Qué es Git exactamente?

Git es un **VCS distribuido** que trabaja con **snapshots** (fotografías), no con diferencias. En esta página vemos qué significa eso por dentro: cómo guarda los datos, por qué es tan rápido y confiable, y de qué están hechos realmente tus commits.

---

## Snapshots vs Diferencias

### El enfoque antiguo: deltas (diferencias)

Los VCS clásicos como **CVS**, **Subversion** y **Perforce** piensan en los datos como una lista de archivos y los cambios que se les hacen con el tiempo. Guardan una **versión base** de cada archivo más una secuencia de **deltas** (las diferencias entre una revisión y la siguiente).

Para reconstruir cómo lucía un archivo en un punto dado, el sistema toma la base y "reproduce" los deltas uno sobre otro hasta llegar a esa revisión.

Consecuencia práctica: cuanto más larga es la historia, más lento se vuelve reconstruir versiones antiguas o comparar a través de muchas revisiones. La cadena de diferencias crece y hay que recorrerla.

### El enfoque de Git: snapshots

Git piensa distinto: trata los datos como un **flujo de snapshots** (fotografías). En cada **commit**, Git toma una foto completa del estado de TODOS tus archivos en ese instante y guarda una referencia a esa foto.

¿Y si un archivo no cambió? Git no lo vuelve a guardar. En su lugar almacena un **puntero** al contenido idéntico que ya tenía guardado (deduplicación por contenido). Así no se duplican datos.

```text
Commit 1: [testA.ts v1] [testB.ts v1] [config.ts v1]
Commit 2: [testA.ts v2] [testB.ts →v1] [config.ts →v1]
Commit 3: [testA.ts →v2] [testB.ts v2] [config.ts v2]
```

La flecha `→` significa "puntero a la versión anterior, no una copia": Git reutiliza el contenido ya almacenado en lugar de duplicarlo.

### Almacenamiento basado en Deltas vs Snapshots

| Almacenamiento basado en deltas (Diferencias) | Almacenamiento basado en Snapshots (Git) |
| :---: | :---: |
| ![Deltas](https://git-scm.com/book/en/v2/images/deltas.png) | ![Snapshots](https://git-scm.com/book/en/v2/images/snapshots.png) |
| *Fuente: [git-scm.com](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F)* | *Fuente: [git-scm.com](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F)* |

> 📌 **Nota fina (para los curiosos):** El **modelo conceptual** de Git es de snapshots, pero EN DISCO no siempre guarda fotos completas. Para ahorrar espacio, Git agrupa periódicamente los objetos en **packfiles**, donde SÍ aplica compresión basada en deltas entre objetos similares (esto ocurre cuando corre `git gc`). Conclusión: obtienes la simplicidad y velocidad del modelo de snapshots a nivel conceptual, más la eficiencia de espacio de los deltas a nivel físico.

> 💡 **Analogía QA:** Un **snapshot** es como tomar una captura de pantalla completa del estado de la app en cada corrida: abrir cualquier corrida pasada es trivial, ya tienes la imagen entera. Un **delta** es como guardar solo el "diff de píxeles" respecto a la captura anterior: para ver una corrida antigua tendrías que reconstruir la cadena paso a paso desde el inicio, aplicando cada diff en orden.

---

## Casi todo es local (por eso Git es rápido)

Git guarda TODA la historia del proyecto en tu disco. No solo la última versión: cada commit, cada rama, cada cambio. Por eso casi toda operación es **local** y no necesita red.

Comandos como `git log`, `git diff`, `git blame`, `git status`, crear ramas y hacer `commit` funcionan al instante, sin conexión.

Contrasta con los VCS centralizados (como **Subversion**): muchas operaciones —ver el historial, comparar versiones— consultan al servidor. Son más lentas y dependen de la red. Si el servidor está caído o no tienes conexión, te quedas bloqueado.

El beneficio práctico es real: trabajas en un avión, sin VPN, sin internet, y los comandos responden casi instantáneamente. Solo necesitas red para sincronizar con otros (`push`/`pull`).

> 💡 **Analogía QA:** Es como tener TODA la base de datos de bugs en tu laptop en vez de consultar un servidor remoto por cada ticket. Buscas, filtras y comparas al instante.

---

## Integridad: todo lleva su huella (checksum SHA)

Antes de guardar cualquier cosa, Git calcula un **checksum** (hash) del contenido y referencia todo por ese hash. Git es **content-addressable**: el "nombre" de un objeto ES el hash de su contenido.

Ese hash es un **SHA-1** de 40 caracteres hexadecimales:

```text
24b9da6552252987aa493b52f8696cd6d3b00373
```

Git está migrando gradualmente a **SHA-256** para mayor seguridad.

La consecuencia clave es que Git es **tamper-evident** (a prueba de manipulación): no puedes cambiar un archivo, un commit ni la historia sin que el hash cambie. Si algo se altera, Git lo detecta. Es justo lo que hace posible el principio que vimos en la historia de Git: es **imposible modificar el historial sin que se note**.

Un dato tranquilizador: Git casi siempre solo AGREGA datos. Una vez que confirmas algo en un commit, es muy difícil perderlo.

> 💡 **Analogía QA:** Es como el checksum (hash) de un build o artefacto. Si cambia un solo byte, el hash cambia y sabes de inmediato que no es el mismo binario que probaste.

---

## El modelo de objetos: blob, tree y commit

Por dentro, Git no guarda "archivos" ni "carpetas" tal cual: guarda todo como unos pocos tipos de **objetos**, y cada objeto se identifica por su **hash** SHA (el mismo principio de integridad que vimos en la sección anterior).

Hay tres tipos principales:

- **blob**: el contenido de un archivo. Solo los bytes. NO guarda el nombre ni la ruta del archivo.
- **tree**: representa un directorio. Es una lista de entradas, cada una con nombre + permisos + un puntero a un **blob** (si es un archivo) o a otro **tree** (si es una subcarpeta).
- **commit**: apunta a UN **tree** (la foto raíz del proyecto en ese instante), al/los **commit** padre(s), y guarda autor, fecha y mensaje.

Así se ven encadenados:

```text
commit 24b9da…
   │  autor, fecha, mensaje
   │  parent → (commit anterior)
   ▼
tree  (raíz del proyecto)
   ├── blob   testA.ts
   ├── blob   config.ts
   └── tree   tests/
          └── blob   checkout.spec.ts
```

Atando cabos con lo anterior: un **snapshot** no es magia. Es simplemente un `commit` que apunta a un `tree` que captura todo el proyecto en ese instante.

Y aquí encaja la idea de "puntero / deduplicación": si `config.ts` no cambió entre dos commits, ambos `tree` apuntan al **mismo blob**. Mismo contenido → mismo hash → un solo objeto en disco. Por eso Git no duplica datos aunque hagas cien commits.

> 📌 **Nota:** Existe un cuarto tipo de objeto, el **tag anotado**, que sirve para marcar versiones o releases con nombre, autor y mensaje. Lo veremos más adelante.

---

## Los 3 estados de un archivo en Git

A diferencia de otros sistemas, Git gestiona tus archivos a través de tres áreas principales:

```text
  Working Directory   ───>   Staging Area   ───>   Git Directory
   (Área de trabajo)         (Index / Staging)       (Repository)
      "Modificado"             "Preparado"          "Confirmado"
```

![Los 3 estados de Git](https://git-scm.com/book/en/v2/images/areas.png)
*Fuente: [git-scm.com - The Three States](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F)*

1. **Working directory (working tree):** Los archivos que ves en tu editor. Aquí editas tu test.
2. **Staging area (index):** Una "sala de espera" donde pones los cambios que SÍ quieres incluir en el próximo commit.
3. **Repository (.git):** El historial permanente. Lo que está aquí ya está guardado para siempre.

> 📌 **Nota:** Esto conecta con los objetos de arriba: cuando haces `git add`, en realidad vas construyendo el **tree** del próximo snapshot; al hacer `commit`, ese tree queda sellado dentro de un objeto **commit**.

> 💡 **Analogía QA:** Es como preparar un reporte de bugs:
> - `working directory` = los bugs que detectas durante tu sesión de pruebas.
> - `staging area` = los bugs que ya validaste y quieres incluir en el reporte final.
> - `repository` = el reporte enviado al equipo de desarrollo (ya no puedes "des-enviarlo" fácilmente).

---

## (Avanzado · opcional) Ver los objetos por dentro

Esta sección es **opcional**: si vas empezando, puedes saltarla sin problema. Sirve para comprobar con tus propios ojos que los objetos de Git (**blob**, **tree**, **commit**) son reales y no pura teoría. Para ello usaremos unos comandos de "bajo nivel" (lo que en Git se llama **plumbing**, las tuberías internas): no los usarás en tu día a día, pero te dejan asomarte a la base de datos de Git.

Partimos de un repo con dos archivos (`saludo.txt` y `readme.txt`) ya confirmados en un commit.

### 1. El hash de un archivo: `git hash-object`

Calcula el hash (el **blob**) a partir del contenido de un archivo:

```bash
git hash-object saludo.txt
```

```text
24db42bb7b999597a72801da70efd5876059bc0b
```

Ese hash identifica el *contenido* del archivo. Si el contenido es idéntico, el hash es idéntico.

### 2. El tipo de un objeto: `git cat-file -t`

Pregúntale a Git qué clase de objeto es ese hash:

```bash
git cat-file -t 24db42bb7b999597a72801da70efd5876059bc0b
```

```text
blob
```

### 3. El contenido de un objeto: `git cat-file -p`

Ahora imprime lo que guarda ese **blob**:

```bash
git cat-file -p 24db42bb7b999597a72801da70efd5876059bc0b
```

```text
hola mundo
```

### 4. El árbol del último commit: `git cat-file -p HEAD^{tree}`

Un **tree** es como una carpeta: lista los **blobs** (archivos) y subárboles con sus permisos y sus hashes.

```bash
git cat-file -p HEAD^{tree}
```

```text
100644 blob 122b2adb3c86e4bcace029bbde786c8bf492cdd0	readme.txt
100644 blob 24db42bb7b999597a72801da70efd5876059bc0b	saludo.txt
```

Fíjate: el hash de `saludo.txt` aquí (`24db42bb…`) es exactamente el mismo que nos dio `git hash-object` en el paso 1. No es casualidad: es el mismo **blob**.

### 5. El commit en crudo: `git cat-file -p HEAD`

```bash
git cat-file -p HEAD
```

```text
tree 06a01b962cd725cdef14636c02e9c93f0561b7c3
author Demo <demo@example.com> 1781357762 -0600
committer Demo <demo@example.com> 1781357762 -0600

primer commit
```

Aquí ves el **commit** por dentro: la línea `tree …` (apunta al árbol del proyecto), el autor, el committer y el mensaje. (Si este commit tuviera uno anterior, aparecería también una línea `parent …`.)

### Atando cabos

Acabas de ver los tres tipos de objeto en vivo y cómo se encadenan:

- En `cat-file -p HEAD` el **commit** apunta a un **tree** (línea `tree 06a01b96…`).
- En `cat-file -p HEAD^{tree}` ese **tree** apunta a los **blobs** (uno por archivo, con su hash).
- Cada **blob** es el contenido de un archivo, el mismo hash que devuelve `git hash-object`.

Commit → tree → blobs. Eso *es* Git por dentro.

> 📌 **Nota:** El hash de `git hash-object` depende de los **bytes exactos** del archivo, así que los finales de línea importan: un archivo con **CRLF** (típico de Windows) produce un hash distinto al mismo archivo con **LF** (Mac/Linux). Si tu hash no coincide con el de un compañero, casi siempre es por esto. Es lo que controla la opción `core.autocrlf`, que veremos más adelante.
