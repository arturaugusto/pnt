var randomMinMax = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end, startHour, endHour) {
  var date = new Date(+start + Math.random() * (end - start));
  var hour = startHour + Math.random() * (endHour - startHour) | 0;
  date.setHours(hour);
  return date;
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
    var dataTable = []

    var horario_ini = Date.now()
    var horario_fim = null

    for (var i = 2000 - 1; i >= 0; i--) {
      horario_fim = horario_ini + randomMinMax(20000, 21500)


      let horario_ini_m = moment(horario_ini)
      let horario_fim_m = moment(horario_fim)

      horario_ini = horario_fim + randomMinMax(2500, 7500)

      var h = horario_ini_m.hour()
      console.log(h)
      if (h > 8 && h < 16) {

        var resultado_num = (randomMinMax(100, 1000)/100).toFixed(2)
        let obj = {
          os: ''+(1+i)+'/19',
          horario_ini: horario_ini_m.format("DD/MM/YY HH:mm:ss"),
          horario_fim: horario_fim_m.format("DD/MM/YY HH:mm:ss"),
          tecnico: ['Artur Augusto Martins', 'Ramon Martin', 'Diego Nazare'][randomMinMax(0,2)],
          resultado_num: resultado_num,
          resultado: parseFloat(resultado_num) > 8 ? 'Não Conforme' : 'Conforme',
          erro: null
        }
        dataTable.push(obj)
      } else {
        horario_ini += 200000
      }
      
    }
    return {
      busca: '',
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
      aba: 'dashboard', //teste, dashboard,
      dataTable: dataTable
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
      this.aba = 'teste'
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
    },
    dataTableF () {
      return this.dataTable.filter((item) => {
        return ((item.tecnico).indexOf(this.busca) !== -1 || (item.resultado).indexOf(this.busca) !== -1)
      })
    }
  }
}).$mount('#app')

