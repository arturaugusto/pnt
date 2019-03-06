const Inspecao = Vue.component('inspecao', {
  props: ['desc', 'desc2'],
  template: document.getElementById('__template_Inspecao').innerHTML,

  data () {
    return {
      obs: '',
      images: []
    }
  },
  methods: {
    openGallery (index) {
      //console.log(this.$refs.lightbox)
      this.$refs.lightbox.show()
      this.$refs.lightbox.index = index
      
    },
    pegaFoto () {

      var img = {
        link: '',
        alt: ''
      }

      if (this.desc2.indexOf('medidor') !== -1 || this.desc2.indexOf('entrada') !== -1) {
        img.link = './src/img/medidor_'+randomMinMax(1, 1)+'.jpg'
      } else if (this.desc2.indexOf('poste') !== -1) {
        img.link = './src/img/poste_'+randomMinMax(1, 5)+'.jpg'
      } else if (this.desc2.indexOf('caixa') !== -1) {
        img.link = './src/img/caixa_'+randomMinMax(1, 3)+'.jpg'
      } else if (this.desc2.indexOf('lacre') !== -1) {
        img.link = './src/img/lacre_1'+'.jpg'
      }

      this.images.push(img)

    },
    gravaObs () {
      var obsercacoes = [
        'Uma observação gravada pelo técnico.',
        'Audio convertido para texto.',
        'Algo descrito pelo técnico.'
      ]
      this.obs += obsercacoes[randomMinMax(0, obsercacoes.length-1)] + ' '
    }
  },
  computed: {
  }
})