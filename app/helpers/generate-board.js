import { helper } from '@ember/component/helper';

export function generateBoard(params/*, hash*/) {
  let n = params[0]
  let a = Array(n*n)
  a.fill(1,0,(n*n/2) -2)
  a.fill(2,(n*n/2)-2,n*n)
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  a = [1,1,2,1,1,2, 2,2,1,1,1,2, 2,2,1,2,2,1, 1,2,2,1,2,2, 2,1,1,1,2,2, 2,1,1,2,1,1]
  let b = []
  //while(a.length>0){
  //  b.push(a.splice(-n))
  //}
  //return b
  return [a.slice(0,n),a.slice(n,2*n),a.slice(2*n,3*n),a.slice(3*n,4*n),a.slice(4*n,5*n),a.slice(5*n,6*n)];
}

export default helper(generateBoard);
