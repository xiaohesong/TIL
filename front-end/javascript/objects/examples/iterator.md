#### example1
```js
obj = {1: 'num 1', 3: 'num 3', [Symbol.iterator]: function(){
  const keys = Object.keys(this).map(Number).filter(Number)
  const max = Math.max(...keys)
  let current = 0
  const self = this
  return {
    next() {
      console.log('this is', current, this)
      if(current > max){
        return {done: true}
      }else{
        return {done: false, value: this[current++]}
      }
    }
  }
}}

for(let i of obj){
  console.log('value is', i)
}

it = obj[Symbol.iterator]()
it.next()
```
