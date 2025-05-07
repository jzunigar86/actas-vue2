<template>
  <!-- Componente de menú hamburguesa -->
  <div>
    <!-- Icono Hamburguesa -->
    <div class="hamburger" @click="toggleMenu" :class="{ 'active': isOpen }">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </div>

    <!-- Menú Horizontal -->
    <nav class="horizontal-menu" :class="{ 'active': isOpen }">
      <ul>
        <li>
          <router-link 
            to="/Dashboar" 
            class="menu-item"
            @click.native="closeMenu"
            exact-active-class="active-link"
          >
            Registrar
          </router-link>
        </li>
        <li>
          <router-link 
            to="/reportes" 
            class="menu-item"
            @click.native="closeMenu"
            exact-active-class="active-link"
          >
            Consultar
          </router-link>
        </li>
        <li>
          <router-link 
            to="/configuracion" 
            class="menu-item"
            @click.native="closeMenu"
            exact-active-class="active-link"
          >
            Reporte
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Overlay para cerrar el menú -->
    <div 
      class="menu-overlay" 
      :class="{ 'active': isOpen }" 
      @click="closeMenu"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'HamburgerMenu', // Nombre claro para el componente
  data() {
    return {
      isOpen: false
    }
  },
  methods: {
    toggleMenu() {
      this.isOpen = !this.isOpen;
      // Bloquear scroll cuando el menú está abierto
      document.body.style.overflow = this.isOpen ? 'hidden' : '';
    },
    closeMenu() {
      this.isOpen = false;
      document.body.style.overflow = ''; // Restaurar scroll
    }
  },
  beforeDestroy() {
    // Asegurarse de restaurar el scroll al destruir el componente
    document.body.style.overflow = '';
  }
}
</script>

<style scoped>
/* Estilos del botón hamburguesa */
.hamburger {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 30px;
  height: 24px;
  cursor: pointer;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s ease;
}

.hamburger-line {
  display: block;
  width: 100%;
  height: 3px;
  background: #2c3e50;
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger.active {
  transform: translateX(180px);
}

.hamburger.active .hamburger-line:nth-child(1) {
  transform: translateY(10px) rotate(45deg);
}

.hamburger.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.hamburger.active .hamburger-line:nth-child(3) {
  transform: translateY(-10px) rotate(-45deg);
}

/* Menú horizontal */
.horizontal-menu {
  position: fixed;
  top: 0;
  left: -100%;
  width: 100%;
  height: 60px;
  background: #2c3e50;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 1000;
}

.horizontal-menu.active {
  left: 0;
}

.horizontal-menu ul {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  height: 100%;
  justify-content: center;
  align-items: center;
}

.horizontal-menu li {
  margin: 0 20px;
}

/* Items del menú */
.menu-item {
  color: white;
  text-decoration: none;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.active-link {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

/* Overlay */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 999;
}

.menu-overlay.active {
  opacity: 1;
  pointer-events: all;
}

/* Contenido principal - Asegurar margen */
.main-content {
  margin-top: 80px;
  padding: 20px;
}

/* Media queries para responsive */
@media (max-width: 768px) {
  .horizontal-menu {
    height: auto;
    padding: 60px 0 20px;
  }
  
  .horizontal-menu ul {
    flex-direction: column;
    align-items: flex-start;
    padding: 0 20px;
  }
  
  .horizontal-menu li {
    margin: 10px 0;
    width: 100%;
  }
  
  .menu-item {
    display: block;
    padding: 12px 20px;
  }
  
  .hamburger.active {
    transform: none;
  }
}
</style>