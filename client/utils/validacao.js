// ---------------- FORMATAÇÃO PLACA ----------------
export const formatarPlaca = (valor) => {

  let placa = valor.toUpperCase().replace(/[^A-Z0-9]/g, "")

  if (placa.length > 7) {
    placa = placa.slice(0, 7)
  }

  // adiciona hífen se for placa antiga
  if (placa.length > 3 && /^[A-Z]{3}[0-9]/.test(placa)) {
    placa = placa.slice(0, 3) + "-" + placa.slice(3)
  }

  return placa
}


// ---------------- VALIDAÇÃO PLACA ----------------
export const validarPlaca = (placa) => {

  if (!placa) return false

  const limpa = placa.replace("-", "")

  const placaAntiga = /^[A-Z]{3}[0-9]{4}$/
  const placaMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/

  return placaAntiga.test(limpa) || placaMercosul.test(limpa)
}


// ---------------- FORMATAÇÃO RENAVAM ----------------
export const formatarRenavam = (valor) => {

  let renavam = valor.replace(/\D/g, "")

  if (renavam.length > 11) {
    renavam = renavam.slice(0, 11)
  }

  return renavam
}


// ---------------- VALIDAÇÃO RENAVAM ----------------
export const validarRenavam = (renavam) => {

  if (!renavam) return false

  const limpa = renavam.replace(/\D/g, "")

  return limpa.length === 11
}

// ---------------- FORMATAÇÃO KM ----------------
export const formatarKm = (valor) => {

  let numero = valor.replace(/\D/g, "")

  if (!numero) return ""

  return Number(numero).toLocaleString("pt-BR")
}


// ---------------- FORMATAÇÃO MEDIDA PNEU ----------------
export const formatarMedidaPneu = (valor) => {

  let numeros = valor.replace(/\D/g, "")

  // limite total: 7 números (1756514)
  if (numeros.length > 7) {
    numeros = numeros.slice(0, 7)
  }

  let medida = numeros

  // adiciona /
  if (numeros.length > 3) {
    medida = numeros.slice(0, 3) + "/" + numeros.slice(3)
  }

  // adiciona R
  if (numeros.length > 5) {
    medida = numeros.slice(0,3) + "/" + numeros.slice(3,5) + " R" + numeros.slice(5)
  }

  return medida
}

// ----------- VALIDAR VALOR DO PNEU -----------
export const formatarMoeda = (valor) => {

  let numero = valor.replace(/\D/g, "")

  if (!numero) return ""

  numero = (Number(numero) / 100).toFixed(2)

  return Number(numero).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  })
}