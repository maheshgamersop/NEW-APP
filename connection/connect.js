import mongoose from 'mongoose'

const connect = ()=>{
  mongoose.connect('mongodb+srv://thegangstaguy001:NuLcOmlDKV6UGNoi@cluster0.nh1ewxi.mongodb.net/chatting?retryWrites=true&w=majority').then(()=>{
    console.log('CONNECTED TO DATABASE')
  }).catch(err=>{
    console.log('ERROR IN CONNECTING TO DATABASE', err)
  })
}
export default connect