import * as ACTIONS from './actions'

const Reducer = (state = [], action) => {
     switch(action.type){
         case ACTIONS.INIT_STATE: {
             return [
                 ...action.payload
             ]
         }
         case ACTIONS.CHANGE_CELL: {
             const { id, key, data } = action.payload
             const newState = state.map(user => {
                if(user.id === id){
                    user[key] = data
                }
                return {
                    ...user
                } 
             })
            return newState
        }

        case ACTIONS.CHANGE_ORDER: {
            const { idSource, idTarget } = action.payload
            return [ ...state ]
       }
         default: {
            return state 
         }
     }
}

export default Reducer