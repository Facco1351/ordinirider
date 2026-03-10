// Calcola totale, tasse e bonifico di una giornata
export function calcolaGiornata(g) {
  const totale   = Number(g.ordini_consegnati) + Number(g.incentivi) + Number(g.mance)
  const tasse    = (Number(g.ordini_consegnati) * 0.20) + (Number(g.incentivi) * 0.20) + (Number(g.mance) * 0.20) + 2
  const bonifico = totale - tasse - Number(g.contanti)
  return { totale, tasse, bonifico }
}

// Aggrega totali di un array di giornate
export function aggregaGiornate(giornate) {
  const t = {
    ordini: 0, consegnati: 0, incentivi: 0, mance: 0,
    contanti: 0, benzina: 0, km: 0,
  }
  for (const g of giornate) {
    t.ordini     += Number(g.numero_ordini)
    t.consegnati += Number(g.ordini_consegnati)
    t.incentivi  += Number(g.incentivi)
    t.mance      += Number(g.mance)
    t.contanti   += Number(g.contanti)
    t.benzina    += Number(g.benzina)
    t.km         += Number(g.km)
  }
  const totale   = t.consegnati + t.incentivi + t.mance
  const tasse    = (t.consegnati * 0.20) + (t.incentivi * 0.20) + (t.mance * 0.20) + 2
  const bonifico = totale - tasse - t.contanti
  return { ...t, totale, tasse, bonifico }
}

// Nomi mesi italiani
export const MESI = [
  'Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
  'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'
]
export const MESI_SHORT = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic']

export const GIORNI = ['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica']

export const LUOGHI = ['Terlizzi','Molfetta','Bisceglie','Corato','Altro']

// Formattazione euro
export const fmt = (n) => Number(n).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
