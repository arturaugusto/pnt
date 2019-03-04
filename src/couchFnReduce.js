/* Couch db map function
function(doc) {
  if (doc.calibracoes) {
    emit([doc._id, 0], doc);
  } else if (doc.type.split('_')[0] === "config") {
    emit([doc._id, 1], doc);
  } else if (doc.type.split('_')[0] === "ocorr") {
    emit([doc._id, 2], doc);
  }
}

*/
var couchFnReduce = function(keys, values, rereduce) {
  /**
  Denormaliza os dados das calibrações
  obtendo o seguinte schema:

  [
    {
      "Certificado": "166317-101",
      "CertificadoAl": "166317-101",
      "HoraInicial": "2018-06-19 00:00:00",
      "CodigoFaixaModelo": "3528",
      "DescFaixa": "8 °C a 31,5 °C",
      "Freq": "",
      "FreqPrefixo": "",
      "Prefixo": "",
      "Unidade": "°C",
      "cod": "serie",
      "data": {
        "IncertExpandidaUsada": [
          0.04,
          0.04,
          0.04
        ],
      
        ...
      
      "nomeSerie": "Série"
    },
    {
      "Certificado": "152121-101",
      
      ...

    }
  ]
  */
  var seriesDenorm = function(calibracoes) {
    var cal
    var faixa, faixas
    var serie, series
    var row
    var res = []
    var i, j, k, l
    var key
    var calKeys = ['Certificado', 'CertificadoAl', 'HoraInicial']
    var faixaKeys = ['CodigoFaixaModelo', 'DescFaixa', 'Freq', 'FreqPrefixo', 'Prefixo', 'Unidade']
    var serieKeys = ['cod', 'data']
    
    var historico = {}
    
    for (i = 0; i < calibracoes.length; i++) {
      cal = calibracoes[i]
      faixas = cal.Faixas
      for (j = 0; j < faixas.length; j++) {
        faixa = faixas[j]
        series = faixa.series
        for (k = 0; k < series.length; k++) {
          serie = series[k]
          row = {}
          
          for (l = 0; l < calKeys.length; l++) {
            key = calKeys[l]
            row[key] = cal[key]
          }
          
          for (l = 0; l < faixaKeys.length; l++) {
            key = faixaKeys[l]
            row[key] = faixa[key]
          }

          for (l = 0; l < serieKeys.length; l++) {
            key = serieKeys[l]
            row[key] = serie[key]
          }
          row['nomeSerie'] = serie['nome']

          res.push(row)
        }
      }
    }
    return res
  }

  /**
  Denormaliza resultados das calibracoes obtendo o seguinte schema:

  [
    {
      "cod": "serie",
      "CodigoFaixaModelo": "3528",
      "HoraInicial": "2018-06-19 00:00:00",
      ...
      "Valor": 22,
      "fatork": 2
    },
    ...
  ]  
  */
  var serieResultDenorm = function(seriesDenormData) {
    // Adiciona historico para cada serie
    var res = []
    for (var i = 0; i < seriesDenormData.length; i++) {
      row = seriesDenormData[i]
      

      var keys = Object.keys(row.data)
      for (var j = 0; j < row.data.Valor.length; j++) {
        var obj = {
          cod: row.cod,
          CodigoFaixaModelo: row.CodigoFaixaModelo,
          HoraInicial: row.HoraInicial
        }
        for (var k = 0; k < keys.length; k++) {
          obj[keys[k]] = row.data[keys[k]][j]
        }
        res.push(obj)
      }
    }
    return res
  }

  /**
  Altera o objeto `seriesDenormRes` adicionando os dados históricos.
  schema:

  [
    {
      ...
      "nomeSerie": "Série"
      "historicosPontos": [
        [
          {
            "HoraInicial": "2016-06-14 00:00:00",
            "nomeSerie": "Série",
            "serie": {
              "ErroMaximoFaixa": 0.1,
              "ErroMinimoFaixa": -0.1,
              "IncertExpandidaUsada": 0.05,
              "ResultadoMedicao": 0.09,
              "Valor": 22,
              "ValorDoInstrumento": 22.1,
              "ValorDoPadrao": 22,
              "fatork": 2
            },
            ...
          }
        ],
      ...
    },
    ...
  ]

  */
  var adicionaHistoricoDosPontos = function(seriesDenormRes, serieResultDenormRes) {
    for (var i = 0; i < seriesDenormRes.length; i++) {
      var row = seriesDenormRes[i]
      row.historicosPontos = []
      for (var j = 0; j < row.data.Valor.length; j++) {
        var valor = row.data.Valor[j]
        var histValorFaixa = serieResultDenormRes.filter(function(item) {
          return item.Valor === valor &&
            item.HoraInicial === row.HoraInicial &&
            item.CodigoFaixaModelo === row.CodigoFaixaModelo
          ;
        }).map(function(item) {
          var obj = {
            HoraInicial: row.HoraInicial,
            nomeSerie: row.nomeSerie,
            serie: {}
          }
          var keys = ['ErroMaximoFaixa', 'ErroMinimoFaixa', 'IncertExpandidaUsada', 'ResultadoMedicao', 'Valor', 'ValorDoInstrumento', 'ValorDoPadrao', 'fatork']
          for (var i = 0; i < keys.length; i++) {
            obj.serie[keys[i]] = item[keys[i]]
          }
          return obj
        })

        row.historicosPontos.push(histValorFaixa)
      }
    }
  }

  var i;
  var res = {
    inst: {},
    config: [],
    ocorr: [],
    analise: {}
  };

  var calibracoes
  if (rereduce) {
    for(i = 0; i < values.length; i++) {
      if (values[i].inst && values[i].inst.calibracoes) {
        calibracoes = values[i].inst.calibracoes
        var keys = Object.keys(values[i].inst).filter(function(item) {return item !== 'calibracoes'})
        for (var j = 0; j < keys.length; j++) {
          var key = keys[j]
          res.inst[key] = values[i].inst[key]
        }
      }
      if (values[i].config.length) {
        res.config.push.apply(res.config, values[i].config);
      }
      if (values[i].ocorr.length) {
        res.ocorr.push.apply(res.ocorr, values[i].ocorr);
      }
    }

    // Itera o inverso das configurações disponiveis 
    // desta forma pegando apenas as ultimas configuracoes
    var item;
    for (i = res.config.length - 1; i >= 0; i--) {
      item = res.config[i].analise
      if (item) {
        var itemKeys = Object.keys(item)
        for (var j = 0; j < itemKeys.length; j++) {
          var codigoFaixa = itemKeys[j]
          if (!res.analise[codigoFaixa]) {
            res.analise[codigoFaixa] = item[codigoFaixa]
          }
        }
      }
    }
    var seriesDenormRes = seriesDenorm(calibracoes)
    //console.log(seriesDenormRes)
    var serieResultDenormRes = serieResultDenorm(seriesDenormRes)
    //console.log(serieResultDenormRes)
    adicionaHistoricoDosPontos(seriesDenormRes, serieResultDenormRes)
    //console.log(seriesDenormRes)
    res.seriesDenormRes = seriesDenormRes
    return res

  } else {
    for(i = 0; i < values.length; i++) {
      if (keys[i][0][1] === 0) {
        res.inst = values[i]
      }
      if (keys[i][0][1] === 1) {
        res.config.push(values[i])
      }
      if (keys[i][0][1] === 2) {
        res.ocorr.push(values[i])
      }
    }
    return res;
  }
}