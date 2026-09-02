import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { crearFechaEnZona } from '@/shared/utils/fechas'
import {
  agruparPorMomentoDia,
  obtenerMomentoDia
} from '@/shared/utils/momentosDia'

describe('obtenerMomentoDia', () => {
  it('clasifica antes del mediodía como mañana', () => {
    const fecha = crearFechaEnZona(2026, 9, 2, 11, 59)
    assert.equal(obtenerMomentoDia(fecha), 'manana')
  })

  it('clasifica mediodía como tarde', () => {
    const fecha = crearFechaEnZona(2026, 9, 2, 12, 0)
    assert.equal(obtenerMomentoDia(fecha), 'tarde')
  })

  it('clasifica 6:59 p. m. como tarde', () => {
    const fecha = crearFechaEnZona(2026, 9, 2, 18, 59)
    assert.equal(obtenerMomentoDia(fecha), 'tarde')
  })

  it('clasifica 7:00 p. m. como noche', () => {
    const fecha = crearFechaEnZona(2026, 9, 2, 19, 0)
    assert.equal(obtenerMomentoDia(fecha), 'noche')
  })
})

describe('agruparPorMomentoDia', () => {
  it('agrupa en orden mañana, tarde y noche omitiendo vacíos', () => {
    const items = [
      { id: 'n', fecha: crearFechaEnZona(2026, 9, 2, 20, 0) },
      { id: 'm', fecha: crearFechaEnZona(2026, 9, 2, 10, 0) },
      { id: 't', fecha: crearFechaEnZona(2026, 9, 2, 15, 0) }
    ]

    const grupos = agruparPorMomentoDia(items, (item) => item.fecha)

    assert.deepEqual(
      grupos.map((grupo) => grupo.momento),
      ['manana', 'tarde', 'noche']
    )
    assert.deepEqual(
      grupos.map((grupo) => grupo.items.map((item) => item.id)),
      [['m'], ['t'], ['n']]
    )
  })
})
