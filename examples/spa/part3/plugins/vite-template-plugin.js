const fileRegex = /\.(template)$/

export default function templatePlugin(){
    return {
        name: 'template-loader-plugin',

        transform(src, id) {
            if(fileRegex.test(id)) {
                return {
                    code: `export default function template(props = {}){return \`${src}\`}`,
                    map: null,
                }
            }
        }
    }
}