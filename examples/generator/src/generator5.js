async function* GetGenerator() {
  let query;
  while (true) {
    if (query) {
      query = yield await fetch(`https://jsonplaceholder.typicode.com/${query}`).then((res) => res.json());
    } else {
        query = yield null;
    }
  }
}

const init = () => {
    const gen = GetGenerator()
    gen.next()

    return {
         getData: async (query) => {
            const data = await gen.next(query)
            if(!data.done){
              return data.value
            }
        },
        stop: (data) => {
          gen.return(data)
        },
        error: () => {
          gen.throw(new Error('it is an error'))
        }
    }
}

export default init
