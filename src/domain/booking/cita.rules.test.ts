import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { esCitaYaOcurrida } from './cita.rules'

describe('esCitaYaOcurrida', () => {
  it('permite marcar una cita pasada como atendida', () => {
    const ahora = new Date('2026-08-20T16:00:00.000Z')
    const citaPasada = new Date('2026-08-19T15:00:00.000Z')

    assert.equal(esCitaYaOcurrida(citaPasada, ahora), true)
  })

  it('bloquea marcar una cita futura como atendida', () => {
    const ahora = new Date('2026-08-20T16:00:00.000Z')
    const citaFutura = new Date('2026-08-21T10:00:00.000Z')

    assert.equal(esCitaYaOcurrida(citaFutura, ahora), false)
  })

  it('permite marcar una cita exactamente en el momento actual', () => {
    const ahora = new Date('2026-08-20T16:00:00.000Z')

    assert.equal(esCitaYaOcurrida(ahora, ahora), true)
  })
})

describe('resumen Pasadas tras marcar atendida', () => {
  it('mantiene citas completadas en el listado del rango (sin filtrar por estado)', () => {
    const citasDelRango = [
      {
        id: '1',
        estado: 'pendiente' as const,
        precio: 500,
        fechaHora: new Date('2026-08-18T14:00:00.000Z')
      },
      {
        id: '2',
        estado: 'completada' as const,
        precio: 800,
        fechaHora: new Date('2026-08-17T11:00:00.000Z')
      }
    ]

    // Simula el resultado de obtenerCitasPorRango (solo negocioId + fechas).
    const trasMarcarAtendida = citasDelRango.map((cita) =>
      cita.id === '1' ? { ...cita, estado: 'completada' as const } : cita
    )

    assert.equal(trasMarcarAtendida.length, 2)
    assert.ok(trasMarcarAtendida.some((cita) => cita.id === '1'))
    assert.equal(
      trasMarcarAtendida.find((cita) => cita.id === '1')?.estado,
      'completada'
    )

    const completadas = trasMarcarAtendida.filter(
      (cita) => cita.estado === 'completada'
    )
    const total = completadas.reduce(
      (acumulado, cita) => acumulado + cita.precio,
      0
    )

    assert.equal(completadas.length, 2)
    assert.equal(total, 1300)
  })
})
