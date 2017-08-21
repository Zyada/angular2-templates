import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { Stat } from '../stat'
import { COLORS } from '../color-database';


@Component({
  moduleId: "app/charts/stacked-barchart/",
  selector: 'stacked-barchart',
  templateUrl: 'stacked-barchart.component.html',
  styleUrls: ['stacked-barchart.component.css']
})
export class StackedBarchartComponent {
  //attributes
  @Input() data: any[]

  @Input() inputheight: number;
  logOfBV: number
  lineHeight: any[] = []
  yAxisPos = 50
  xAxisPos = 31
  biggestValue = 0
  step: number
  height = 400
  width = 400
  tot = 0
  rectangles: any[] = [];

  //methods
  getX(i: number) {
    return this.yAxisPos + this.step * (7 * i + 1.1)
  }

  sortByValue(array: any[]) {
    for (let i = 0; i < array.length - 1; i++) {
      if (array[i].value > array[i + 1].value) {
        let tmp = array[i]
        array[i] = array[i + 1]
        array[i + 1] = tmp
        array = this.sortByValue(array)
      }
    }
    return array
  }

  line(array: any[], log: number) {
    for (let i = 1; i <= Math.round(this.biggestValue) / (10 ** log); i++) {
      if (i != 10) {
        let name = i * 10 ** log
        let nr = this.xAxisPos * (1 - name / (1.1 * this.biggestValue))
        if (log === -1) {
          name = Math.round(name * 10) / 10
        }
        array.push({ nr: nr, name: name })
      }
    }
    if (array.length < 2) {
      array = this.line(array, log - 1)
    } else if (array.length < 5) {
      array = this.line50(array, log)
    }

    return array
  }
  line50(array: any[], log: number) {
    for (let i = 0.5; i <= this.biggestValue / (10 ** log); i++) {
      let name = i * 10 ** log
      let nr = this.xAxisPos * (1 - name / (1.1 * this.biggestValue))
      array.push({ nr: nr, name: name })
    }
    return array
  }


  constructor() {
    this.xAxisPos = this.height - this.xAxisPos
  }


  ngOnChanges() {
    this.tot = 0
    if (this.data && this.data.length > 0) {
      for (let i = 0; i < this.data.length; i++) {
        for (let j = 0; j < this.data[i].stat.length; j++) {
          this.tot += this.data[i].stat[j].value;
        }
      }
      if (this.tot > 0) this.chart();
    }
  }

  chart() {
    //this.rectangles = this.data
    this.data.forEach(element => {
      let label = element.label
      let stat: any[] = [];
      for(let i = 0; i < element.stat.length; i++){
        let name = element.stat[i].name
        let value = element.stat[i].value
        stat.push({name: name, value: value})
      }
      this.rectangles.push({label: label, stat: stat});
    });
    this.lineHeight = []
    for (var i in this.rectangles) {
      this.rectangles[i].stat = this.sortByValue(this.rectangles[i].stat);
    }
    for (let i = 0; i < this.rectangles.length; i++) {
      this.rectangles[i].totvalue = 0;
      for (let j = 0; j < this.rectangles[i].stat.length; j++) {
        this.rectangles[i].totvalue += this.rectangles[i].stat[j].value
        this.rectangles[i].stat[j].color = COLORS[this.rectangles[i].stat.length - j -1];
      }
    }

    this.step = (this.width - this.yAxisPos) / (7 * this.rectangles.length)
    //Finds biggestValue
    this.biggestValue = 0
    for (let i = 0; i < this.rectangles.length; i++) {
      if (this.rectangles[i].totvalue > this.biggestValue) {
        this.biggestValue = this.rectangles[i].totvalue
      }
    }
    let log = Math.log10(this.biggestValue)
    this.logOfBV = Math.round(log)
    if (this.biggestValue / 10 ** this.logOfBV < 1) {
      this.logOfBV--
    }
    let mod = this.biggestValue % (10 ** this.logOfBV)
    if (mod / (10 ** (this.logOfBV - 1)) > 6.5) {
      this.biggestValue = Math.round(this.biggestValue / (10 ** this.logOfBV)) * (10 ** this.logOfBV)
    } else if (mod / (10 ** (this.logOfBV - 1)) < 5 && mod / (10 ** (this.logOfBV - 1)) > 1.5) {
      this.biggestValue += 5 * (10 ** (this.logOfBV - 1)) - mod
    }
    this.lineHeight = this.line(this.lineHeight, this.logOfBV)
    this.biggestValue = 1.1 * this.biggestValue

    for (let i = 0; i < this.rectangles.length; i++) {
      let x1 = this.getX(i);
      let totusedValue = this.rectangles[i].totvalue * this.xAxisPos / this.biggestValue
      this.rectangles[i].labelpos = x1 + this.step * 2.5;
      for (var j in this.rectangles[i].stat) {
        this.rectangles[i].stat[j].x1 = x1;
        this.rectangles[i].stat[j].usedValue = this.rectangles[i].stat[j].value * this.xAxisPos / this.biggestValue

        this.rectangles[i].stat[j].y1 = this.xAxisPos - totusedValue
        totusedValue -= this.rectangles[i].stat[j].usedValue
      }
    }
    this.step = this.step * 5
  }
}
