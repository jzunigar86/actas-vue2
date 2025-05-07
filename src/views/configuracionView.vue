<template>
  <div class="dashboard-container">
    <h1>REPORTES DE ACTAS</h1>

    <!-- Menú de selección de tablas -->
    <div class="menu">
      <button @click="showTable('lugares')">Todas las IED</button>
      <button @click="showTable('tipos')">Cantidad Según Tipo</button>
      <button @click="showTable('compromisos')">Compromisos</button>
      <button @click="showTable('lugaresPorTipo')">IED por Tipo de Acta</button>
      <button @click="downloadFullReport">Informe Completo</button>
    </div>

    <!-- Tabla de todas las IED -->
    <div v-if="activeTable === 'lugares'" class="table-container">
      <h2>TODAS LAS INSTITUCIONES EDUCATIVAS</h2>
      <table>
        <thead>
          <tr>
            <th>INSTITUCIÓN EDUCATIVA</th>
            <th>TOTAL DE ACTAS</th>
            <th>PORCENTAJE</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(lugar, index) in allLugares" :key="index">
            <td>{{ lugar.nombre }}</td>
            <td>{{ lugar.cantidad }}</td>
            <td>{{ ((lugar.cantidad / totalActas) * 100).toFixed(2) }}%</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td><strong>TOTAL</strong></td>
            <td><strong>{{ totalActas }}</strong></td>
            <td><strong>100%</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Tabla de cantidad por tipo de acta -->
    <div v-if="activeTable === 'tipos'" class="table-container">
      <h2>CANTIDAD POR TIPO DE ACTA</h2>
      <table>
        <thead>
          <tr>
            <th>TIPO DE ACTA</th>
            <th>TOTAL</th>
            <th>PORCENTAJE</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cantidad, tipo) in cantidadPorTipoActa" :key="tipo">
            <td>{{ tipo }}</td>
            <td>{{ cantidad }}</td>
            <td>{{ ((cantidad / totalActas) * 100).toFixed(2) }}%</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td><strong>TOTAL</strong></td>
            <td><strong>{{ totalActas }}</strong></td>
            <td><strong>100%</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Tabla de compromisos con filtros mejorados -->
    <div v-if="activeTable === 'compromisos'" class="table-container">
      <h2>ACTAS CON COMPROMISOS</h2>
      <div class="filter-controls">
        <div class="filter-group">
          <label>
            <input type="checkbox" v-model="showOnlyOverdue"> Mostrar solo vencidos
          </label>
          <span class="count overdue-count">{{ overdueCount }} vencidos</span>
          <span class="count pending-count">{{ pendingCount }} pendientes</span>
          <span class="count total-count">{{ totalCompromisos }} totales</span>
        </div>
        
        <div class="filter-group">
          <label for="lugarFilter">Filtrar por IED:</label>
          <select id="lugarFilter" v-model="selectedLugar">
            <option value="">Todas las IED</option>
            <option v-for="lugar in lugaresList" :key="lugar" :value="lugar">
              {{ lugar }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="tipoFilter">Filtrar por tipo:</label>
          <select id="tipoFilter" v-model="selectedTipo">
            <option value="">Todos los tipos</option>
            <option v-for="tipo in tiposList" :key="tipo" :value="tipo">
              {{ tipo }}
            </option>
          </select>
        </div>
      </div>

      <table class="commitments-table">
        <thead>
          <tr>
            <th>CÓDIGO ACTA</th>
            <th>FECHA</th>
            <th>IED</th>
            <th>TIPO</th>
            <th>ESTADO</th>
            <th>DÍAS</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="acta in filteredActas" :key="acta.codigoUnico" @click="showActaDetails(acta)" class="acta-row">
            <td>{{ acta.codigoUnico }}</td>
            <td>{{ formatDate(acta.fecha) }}</td>
            <td>{{ acta.lugar }}</td>
            <td>{{ acta.acta }}</td>
            <td>
              <span class="status-badge" :class="getActaStatusClass(acta)">
                {{ getActaStatus(acta) }}
              </span>
            </td>
            <td>
              <span v-if="getCompromisos(acta).length > 0">
                {{ getDaysCount(getCompromisos(acta)[0].fecha) }}
              </span>
              <span v-else>-</span>
            </td>
            <td class="actions-cell">
              <button class="view-btn" @click.stop="showActaDetails(acta)">
                <i class="fas fa-eye"></i> Ver
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tabla de lugares por tipo de acta -->
    <div v-if="activeTable === 'lugaresPorTipo'" class="table-container">
      <h2>INSTITUCIONES EDUCATIVAS POR TIPO DE ACTA</h2>
      <div v-for="(lugares, tipo) in lugaresPorTipoActa" :key="tipo">
        <h3>{{ tipo }}</h3>
        <table>
          <thead>
            <tr>
              <th>INSTITUCIÓN EDUCATIVA</th>
              <th>CANTIDAD</th>
              <th>PORCENTAJE</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(lugar, index) in lugares" :key="index">
              <td>{{ lugar.nombre }}</td>
              <td>{{ lugar.cantidad }}</td>
              <td>{{ ((lugar.cantidad / totalActasPorTipo(tipo)) * 100).toFixed(2) }}%</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td><strong>TOTAL</strong></td>
              <td><strong>{{ totalActasPorTipo(tipo) }}</strong></td>
              <td><strong>100%</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div v-if="selectedActa" class="modal-overlay" @click.self="selectedActa = null">
      <div class="modal-content">
        <button class="close-modal" @click="selectedActa = null">×</button>
        <h3>DETALLES COMPLETOS DEL ACTA {{ selectedActa.codigoUnico }}</h3>
        
        <div class="modal-section">
          <h4>INFORMACIÓN GENERAL</h4>
          <div class="info-grid">
            <div><strong>Institución Educativa:</strong> {{ selectedActa.lugar }}</div>
            <div><strong>Tipo de Acta:</strong> {{ selectedActa.acta }}</div>
            <div><strong>Fecha del Acta:</strong> {{ formatDate(selectedActa.fecha) }}</div>
            <div><strong>Objetivo:</strong> {{ selectedActa.objetivo || 'No especificado' }}</div>
          </div>
        </div>

        <div class="modal-section">
          <h4>COMPROMISOS</h4>
          <div v-if="getCompromisos(selectedActa).length > 0" class="commitments-container">
            <div v-for="(compromiso, index) in getCompromisos(selectedActa)" 
                 :key="index" class="commitment-card" :class="getDateClass(compromiso.fecha)">
              <div class="commitment-header">
                <h5>COMPROMISO #{{ index + 1 }}</h5>
                <span class="status-badge" :class="getDateClass(compromiso.fecha)">
                  {{ getDaysStatus(compromiso.fecha) }}
                </span>
              </div>
              <div class="commitment-body">
                <p><strong>Descripción:</strong> {{ compromiso.descripcion }}</p>
                <p><strong>Responsable:</strong> {{ compromiso.responsable || 'No especificado' }}</p>
                <p><strong>Fecha compromiso:</strong> {{ formatDate(compromiso.fecha) }}</p>
                <p><strong>Días:</strong> {{ getDaysCount(compromiso.fecha) }}</p>
              </div>
            </div>
          </div>
          <div v-else class="no-commitments">
            Esta acta no tiene compromisos registrados.
          </div>
        </div>

        <div class="modal-section" v-if="selectedActa.observaciones">
          <h4>OBSERVACIONES</h4>
          <p class="observations-text">{{ selectedActa.observaciones }}</p>
        </div>

        <div class="modal-actions">
          <button class="download-btn" @click="downloadActa(selectedActa)">
            <i class="fas fa-download"></i> Descargar Acta
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import fetchGoogleSheetData from "@/services/fetchGoogleSheetData.js";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default {
  setup() {
    const data = ref([]);
    const activeTable = ref('lugares');
    const showOnlyOverdue = ref(false);
    const selectedActa = ref(null);
    const selectedLugar = ref('');
    const selectedTipo = ref('');

    // Computed properties
    const lugaresList = computed(() => {
      const lugares = new Set();
      data.value.forEach(acta => lugares.add(acta.lugar));
      return Array.from(lugares).sort();
    });

    const tiposList = computed(() => {
      const tipos = new Set();
      data.value.forEach(acta => tipos.add(acta.acta));
      return Array.from(tipos).sort();
    });

    const actasConCompromisos = computed(() => {
      return data.value.filter(acta => 
        (acta.descripcion1 && acta.fechaPrevista1) || 
        (acta.descripcion2 && acta.fechaPrevista2) ||
        (acta.descripcion3 && acta.fechaPrevista3)
      );
    });

    const filteredActas = computed(() => {
      let filtered = actasConCompromisos.value;
      
      // Aplicar filtro por lugar
      if (selectedLugar.value) {
        filtered = filtered.filter(acta => acta.lugar === selectedLugar.value);
      }
      
      // Aplicar filtro por tipo
      if (selectedTipo.value) {
        filtered = filtered.filter(acta => acta.acta === selectedTipo.value);
      }
      
      // Aplicar filtro por vencidos
      if (showOnlyOverdue.value) {
        filtered = filtered.filter(acta => 
          getCompromisos(acta).some(c => isOverdue(c.fecha))
        );
      }
      
      return filtered;
    });

    const totalCompromisos = computed(() => {
      return filteredActas.value.reduce((total, acta) => 
        total + getCompromisos(acta).length, 0);
    });

    const overdueCount = computed(() => {
      return filteredActas.value.reduce((count, acta) => 
        count + getCompromisos(acta).filter(c => isOverdue(c.fecha)).length, 0);
    });

    const pendingCount = computed(() => {
      return totalCompromisos.value - overdueCount.value;
    });

    const lugarCount = computed(() => {
      return data.value.reduce((acc, row) => {
        acc[row.lugar] = (acc[row.lugar] || 0) + 1;
        return acc;
      }, {});
    });

    const allLugares = computed(() => {
      return Object.entries(lugarCount.value)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad);
    });

    const cantidadPorTipoActa = computed(() => {
      return data.value.reduce((acc, row) => {
        acc[row.acta] = (acc[row.acta] || 0) + 1;
        return acc;
      }, {});
    });

    const totalActas = computed(() => {
      return Object.values(cantidadPorTipoActa.value).reduce((sum, val) => sum + val, 0);
    });

    const lugaresPorTipoActa = computed(() => {
      const lugares = data.value.reduce((acc, row) => {
        if (!acc[row.acta]) {
          acc[row.acta] = [];
        }
        const existingLugar = acc[row.acta].find(l => l.nombre === row.lugar);
        if (existingLugar) {
          existingLugar.cantidad += 1;
        } else {
          acc[row.acta].push({ nombre: row.lugar, cantidad: 1 });
        }
        return acc;
      }, {});
      
      // Ordenar cada tipo por cantidad descendente
      Object.keys(lugares).forEach(tipo => {
        lugares[tipo].sort((a, b) => b.cantidad - a.cantidad);
      });
      
      return lugares;
    });

    // Métodos para manejar múltiples compromisos
    const getCompromisos = (acta) => {
      const compromisos = [];
      if (acta.descripcion1 && acta.fechaPrevista1) {
        compromisos.push({
          descripcion: acta.descripcion1,
          fecha: acta.fechaPrevista1,
          responsable: acta.responsable1
        });
      }
      if (acta.descripcion2 && acta.fechaPrevista2) {
        compromisos.push({
          descripcion: acta.descripcion2,
          fecha: acta.fechaPrevista2,
          responsable: acta.responsable2
        });
      }
      if (acta.descripcion3 && acta.fechaPrevista3) {
        compromisos.push({
          descripcion: acta.descripcion3,
          fecha: acta.fechaPrevista3,
          responsable: acta.responsable3
        });
      }
      return compromisos;
    };

    const getActaStatus = (acta) => {
      const compromisos = getCompromisos(acta);
      if (compromisos.some(c => isOverdue(c.fecha))) return 'CON VENCIDOS';
      if (compromisos.some(c => isNearDue(c.fecha))) return 'POR VENCER';
      return 'AL DÍA';
    };

    const getActaStatusClass = (acta) => {
      const compromisos = getCompromisos(acta);
      if (compromisos.some(c => isOverdue(c.fecha))) return 'overdue';
      if (compromisos.some(c => isNearDue(c.fecha))) return 'warning';
      return 'pending';
    };

    // Métodos para fechas y días
    const isOverdue = (dateString) => {
      if (!dateString) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const date = new Date(dateString);
      return date < today;
    };

    const isNearDue = (dateString) => {
      if (!dateString || isOverdue(dateString)) return false;
      const days = getDaysRemaining(dateString);
      return days <= 7;
    };

    const getDaysRemaining = (dateString) => {
      if (!dateString) return Infinity;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const date = new Date(dateString);
      const diffTime = date - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getDaysCount = (dateString) => {
      const days = getDaysRemaining(dateString);
      if (isOverdue(dateString)) return `${Math.abs(days)} días vencidos`;
      return `${days} días por vencer`;
    };

    const getDaysStatus = (dateString) => {
      if (isOverdue(dateString)) return 'VENCIDO';
      if (isNearDue(dateString)) return 'POR VENCER';
      return 'PENDIENTE';
    };

    const getDateClass = (dateString) => {
      if (isOverdue(dateString)) return 'overdue';
      if (isNearDue(dateString)) return 'warning';
      return 'pending';
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'No especificada';
      try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleDateString('es-ES', options);
      } catch {
        return 'Fecha inválida';
      }
    };

    // Métodos para descarga
    const downloadActa = (acta) => {
      const doc = new jsPDF();
      const compromisos = getCompromisos(acta);
      
      // Título
      doc.setFontSize(16);
      doc.text(`ACTA ${acta.codigoUnico}`, 105, 15, null, null, 'center');
      doc.setFontSize(12);
      
      // Información básica
      doc.text(`Institución Educativa: ${acta.lugar}`, 14, 30);
      doc.text(`Tipo de Acta: ${acta.acta}`, 14, 40);
      doc.text(`Fecha: ${formatDate(acta.fecha)}`, 14, 50);
      doc.text(`Objetivo: ${acta.objetivo || 'No especificado'}`, 14, 60);
      
      // Compromisos
      let yPosition = 80;
      if (compromisos.length > 0) {
        doc.text('COMPROMISOS:', 14, yPosition);
        yPosition += 10;
        
        compromisos.forEach((compromiso, index) => {
          doc.text(`Compromiso ${index + 1}:`, 14, yPosition);
          doc.text(`- Descripción: ${compromiso.descripcion}`, 20, yPosition + 7);
          doc.text(`- Responsable: ${compromiso.responsable || 'No especificado'}`, 20, yPosition + 14);
          doc.text(`- Fecha: ${formatDate(compromiso.fecha)} (${getDaysStatus(compromiso.fecha)})`, 20, yPosition + 21);
          doc.text(`- Días: ${getDaysCount(compromiso.fecha)}`, 20, yPosition + 28);
          yPosition += 40;
        });
      } else {
        doc.text('Esta acta no tiene compromisos registrados.', 14, yPosition);
        yPosition += 10;
      }
      
      // Observaciones
      if (acta.observaciones) {
        doc.text('OBSERVACIONES:', 14, yPosition);
        doc.text(acta.observaciones, 20, yPosition + 7, { maxWidth: 180 });
      }
      
      doc.save(`acta_${acta.codigoUnico}.pdf`);
    };

    const generateReport = (dataToDownload) => {
      const doc = new jsPDF();

      const addTableToPDF = (title, tableData, headers, showTotal = false, totalValue = 0) => {
        doc.text(title, 14, doc.autoTable.previous.finalY + 20 || 20);
        if (showTotal) {
          tableData.push(["TOTAL", totalValue]);
        }
        doc.autoTable({
          head: [headers],
          body: tableData,
          startY: doc.autoTable.previous.finalY + 30 || 30
        });
      };

      if (dataToDownload.allLugares) {
        addTableToPDF('TODAS LAS INSTITUCIONES EDUCATIVAS',
          dataToDownload.allLugares.map(row => [row.nombre, row.cantidad, `${((row.cantidad / dataToDownload.totalActas) * 100).toFixed(2)}%`]), 
          ['IED', 'TOTAL DE ACTAS', 'PORCENTAJE'], 
          true, 
          dataToDownload.totalActas
        );
      }

      if (dataToDownload.cantidadPorTipoActa) {
        addTableToPDF('CANTIDAD POR TIPO DE ACTA',
          Object.entries(dataToDownload.cantidadPorTipoActa).map(([tipo, cantidad]) => 
            [tipo, cantidad, `${((cantidad / dataToDownload.totalActas) * 100).toFixed(2)}%`]),
          ['TIPO DE ACTA', 'TOTAL', 'PORCENTAJE'], 
          true, 
          dataToDownload.totalActas
        );
      }

      if (dataToDownload.actasConCompromisos) {
        const actasData = dataToDownload.actasConCompromisos.flatMap(acta => {
          return getCompromisos(acta).map(compromiso => [
            acta.codigoUnico,
            formatDate(acta.fecha),
            acta.lugar,
            acta.acta,
            compromiso.descripcion,
            formatDate(compromiso.fecha),
            getDaysStatus(compromiso.fecha),
            getDaysCount(compromiso.fecha)
          ]);
        });
        
        addTableToPDF('ACTAS CON COMPROMISOS',
          actasData,
          ['CÓDIGO', 'FECHA', 'IED', 'TIPO', 'COMPROMISO', 'FECHA', 'ESTADO', 'DÍAS'],
          true,
          actasData.length
        );
      }

      if (dataToDownload.lugaresPorTipoActa) {
        Object.entries(dataToDownload.lugaresPorTipoActa).forEach(([tipo, lugares]) => {
          addTableToPDF(`INSTITUCIONES EDUCATIVAS PARA EL TIPO DE ACTA: ${tipo}`,
            lugares.map(lugar => 
              [lugar.nombre, lugar.cantidad, `${((lugar.cantidad / totalActasPorTipo(tipo)) * 100).toFixed(2)}%`]),
            ['IED', 'CANTIDAD', 'PORCENTAJE'], 
            true, 
            totalActasPorTipo(tipo)
          );
        });
      }

      doc.save('informe_completo.pdf');
    };

    const downloadFullReport = () => {
      generateReport({
        allLugares: allLugares.value,
        cantidadPorTipoActa: cantidadPorTipoActa.value,
        actasConCompromisos: actasConCompromisos.value,
        lugaresPorTipoActa: lugaresPorTipoActa.value,
        totalActas: totalActas.value,
        totalActasConCompromisos: totalCompromisos.value
      });
    };

    const showTable = (table) => {
      activeTable.value = table;
    };

    const totalActasPorTipo = (tipo) => {
      const lugares = lugaresPorTipoActa.value[tipo];
      return lugares ? lugares.reduce((sum, lugar) => sum + lugar.cantidad, 0) : 0;
    };

    const showActaDetails = (acta) => {
      selectedActa.value = acta;
    };

    const loadData = async () => {
      try {
        const sheetData = await fetchGoogleSheetData();
        data.value = sheetData;
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    onMounted(loadData);

    return {
      activeTable,
      showOnlyOverdue,
      selectedLugar,
      selectedTipo,
      lugaresList,
      tiposList,
      selectedActa,
      filteredActas,
      allLugares,
      cantidadPorTipoActa,
      totalActas,
      lugaresPorTipoActa,
      totalCompromisos,
      overdueCount,
      pendingCount,
      showTable,
      downloadFullReport,
      totalActasPorTipo,
      showActaDetails,
      downloadActa,
      getCompromisos,
      formatDate,
      getDaysStatus,
      getDaysCount,
      getDateClass,
      getActaStatus,
      getActaStatusClass
    };
  }
};
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
}

.menu {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 30px;
}

.menu button {
  padding: 10px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.menu button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.menu button:active {
  transform: translateY(0);
}

.table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
  padding: 25px;
  margin-bottom: 30px;
}

.table-container h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th {
  background-color: #2c3e50;
  color: white;
  text-align: left;
  padding: 12px 15px;
  font-weight: 600;
  position: sticky;
  top: 0;
}

td {
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
  vertical-align: middle;
}

tfoot td {
  font-weight: bold;
  background-color: #f8f9fa;
}

/* Estilos para la tabla de compromisos */
.commitments-table {
  font-size: 14px;
}

.commitments-table th {
  background-color: #3a5169;
}

.commitments-table tr.acta-row {
  transition: background-color 0.2s;
  cursor: pointer;
}

.commitments-table tr.acta-row:hover {
  background-color: #f8f9fa;
}

.commitments-table .actions-cell {
  white-space: nowrap;
}

/* Estilos para los filtros */
.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  white-space: nowrap;
  font-weight: 500;
  color: #555;
}

.filter-group select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  min-width: 200px;
  background-color: white;
  font-size: 14px;
}

.filter-group input[type="checkbox"] {
  transform: scale(1.2);
  margin-right: 5px;
}

.count {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: bold;
}

.overdue-count {
  background-color: #ffecec;
  color: #e74c3c;
}

.pending-count {
  background-color: #e8f5e9;
  color: #27ae60;
}

.total-count {
  background-color: #e3f2fd;
  color: #1976d2;
}

/* Estilos para estados */
.status-badge {
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  color: white;
  display: inline-block;
  white-space: nowrap;
}

.status-badge.overdue {
  background-color: #e74c3c;
}

.status-badge.warning {
  background-color: #f39c12;
}

.status-badge.pending {
  background-color: #27ae60;
}

/* Estilos para botones */
.view-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.view-btn:hover {
  background-color: #2980b9;
}

.download-btn {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.download-btn:hover {
  background-color: #219653;
}

/* Estilos para el modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.close-modal {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
  transition: color 0.2s;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-modal:hover {
  background-color: #f5f5f5;
  color: #e74c3c;
}

.modal-content h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 18px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.modal-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.modal-section h4 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.info-grid div {
  padding: 8px 0;
}

.info-grid strong {
  color: #555;
}

.commitments-container {
  display: grid;
  gap: 15px;
}

.commitment-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.2s;
}

.commitment-card:hover {
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.commitment-card.overdue {
  border-left: 4px solid #e74c3c;
  background-color: #fff9f9;
}

.commitment-card.warning {
  border-left: 4px solid #f39c12;
  background-color: #fffaf3;
}

.commitment-card.pending {
  border-left: 4px solid #27ae60;
  background-color: #f8fdf8;
}

.commitment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.commitment-header h5 {
  margin: 0;
  color: #2c3e50;
  font-size: 14px;
}

.commitment-body p {
  margin: 5px 0;
  color: #333;
  line-height: 1.5;
  font-size: 14px;
}

.commitment-body strong {
  color: #555;
}

.no-commitments {
  color: #777;
  font-style: italic;
  padding: 15px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.observations-text {
  white-space: pre-line;
  line-height: 1.6;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Iconos */
.fas {
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .menu {
    flex-direction: column;
    align-items: stretch;
  }
  
  .menu button {
    width: 100%;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .filter-group {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-group select {
    width: 100%;
  }
  
  table {
    display: block;
    overflow-x: auto;
  }
  
  .modal-content {
    padding: 20px;
    width: 95%;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .commitments-table .actions-cell {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .view-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>