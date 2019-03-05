var randomMinMax = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var INITIAL_STATE = {}

window.DB_ADDR = 'https://procal.ipt.br:15984/'
Vue.use(Toasted, {theme: "toasted-primary", 
  position: "top-center", 
  duration: 2000,
  iconPack: 'fontawesome'
})

moment.locale('pt-br')

const app = new Vue({
  data () {
    return {
      step: 'ID Unidade',
      steps: [
        'ID Unidade',
        'Inspeções Preliminares',
        'Conexão Instrumentos',
        'Teste de giro e Kd/Kh',
        'Finalizar'
      ],
      localizacao: false,
      nomeResponsavel: '',
      msgTeste: 'Iniciar teste automático',
      executandoTeste: false,
      executandoTesteAntes: false,
      executandoTesteDepois: false,
      a1: '-',
      a2: null,
      a3: '-',
      d1: null,
      d2: null,
      d3: null,
      energia: 0,
      erro: null,
      entradaSaidaDiff: 0,
      burgerActive: false,
      aba: 'dashboard' //teste, dashboard

    }
  },
  created () {
  },
  mounted () {
    INITIAL_STATE = JSON.parse(JSON.stringify(this.$data))
  },
  methods: {
    novoTeste () {
      Object.keys(INITIAL_STATE).map((k) => {
        this[k] = INITIAL_STATE[k]
      })      
    },
    executarTesteAutomatico () {
      
      if (this.executandoTeste) return

      var energiaTeste = 2

      this.a1 = null
      this.a2 = null
      this.a3 = null

      this.d1 = null
      this.d2 = null
      this.d3 = null

      this.erro = null

      this.executandoTeste = true
      var tempoLeitura = 1000;//5000
      this.msgTeste = 'Obtendo leitura inicial...'
      this.executandoTesteAntes = true
      window.setTimeout(() => {
        this.energia = ~~(performance.now())
        this.a1 = 0
        this.a2 = this.energia
        this.a3 = 0

        this.msgTeste = 'Obtendo leitura final...'
        this.executandoTesteAntes = false
        this.executandoTesteDepois = true
        window.setTimeout(() => {

          this.d2 = this.energia + energiaTeste

          this.d1 = parseFloat((energiaTeste+(randomMinMax(0, 20) - 10)/100).toFixed(2))
          this.d3 = parseFloat((energiaTeste+(randomMinMax(0, 20) - 10)/100).toFixed(2))

          this.msgTeste = 'Teste finalizado!'
          this.executandoTesteDepois = false

          this.erro = parseFloat(((((this.d2 - this.a2) - ((this.d1+this.d3)/2)) / ((this.d1+this.d3)/2))*100).toFixed(2))

          this.entradaSaidaDiff = parseFloat((this.d3 - this.d1).toFixed(2))

          window.setTimeout(() => {
            this.msgTeste = 'Iniciar teste automático'
            this.executandoTeste = false
          }, 1000)
        }, tempoLeitura + 2000)
      }, tempoLeitura)
    },
    proximo () {
      if (this.ehUltimo) return
      this.step = this.steps[this.stepIndex + 1]
      window.scrollTo(0, 0);
    },
    anterior () {
      if (this.ehPrimeiro) return
      this.step = this.steps[this.stepIndex - 1]
      window.scrollTo(0, 0);
    }
  },
  computed: {
    ehUltimo () {
      return this.stepIndex === this.steps.length - 1
    },
    ehPrimeiro () {
      return this.stepIndex === 0
    },
    stepIndex () {
      return this.steps.indexOf(this.step)
    }
  }
}).$mount('#app')

