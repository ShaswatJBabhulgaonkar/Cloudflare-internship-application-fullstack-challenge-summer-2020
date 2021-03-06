/*
Shaswat J Babhulgaonkar
Project: Cloudflare Summer 2020 Internship Application Challenge: Full-Stack
*/

class editURL {
  constructor(attributeName) {
    this.attributeName = attributeName,
    this.buffer = ''
  }

  element(element) {
    const attribute = element.getAttribute(this.attributeName)
    if (attribute) {
        element.setAttribute(
            this.attributeName,
            attribute.replace('https://cloudflare.com', 'https://shaswatjbabhulgaonkar.github.io/')
        )
    }
  }
}

class Replacer{
    constructor(textMatch, textReplace){
        this.textMatch = textMatch,
        this.textReplace = textReplace,
        this.buffer = ''
    }
    text(text){
        this.buffer += text.text
        if(text.lastInTextNode){
            text.replace(this.buffer.replace(this.textMatch, this.textReplace))
            this.buffer = ''
        } else
            text.remove()
    }
}

const rewriter = new HTMLRewriter()
  .on('a', new editURL('href'))
  .on('a', new Replacer("Return to cloudflare.com", "Let's go to https://shaswatjbabhulgaonkar.github.io/ :)"))
  .on('h1#title', new Replacer("Variant ", "Corgi #"))
  .on('p#description', new Replacer(" of the take home project!", ". Can't believe this Replacer class actually works"))


addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const response = await fetch(
        "https://cfw-takehome.developers.workers.dev/api/variants",
        { 'content-type': 'application/json'}
    )

    const variants = (await gatherResponse(response))['variants'];

    const NAME = 'variant_experiment'
    const VARIANT_ONE = new Response('Variant 1')
    const VARIANT_TWO = new Response('Variant 2')
    const cookie = request.headers.get('cookie')

    if (cookie && cookie.includes(`${NAME}=variant1`))
        return VARIANT_ONE
    else if (cookie && cookie.includes(`${NAME}=variant2`))
        return VARIANT_TWO
    else {
        let randIndex = Math.random() < 0.5 ? 0 : 1
        let group = randIndex == 0 ? 'variant1' : 'variant2'
        let res = group == 'variant1' ? VARIANT_ONE : VARIANT_TWO

        let result = await fetch(variants[randIndex], {
            headers: {
                'content-type': 'text/html;charset=UTF-8',
                'set-cookie': `${NAME}=${group}`
            }
        })

        return rewriter.transform(result)
    }
}

async function gatherResponse(response) {
    const { headers } = response
    const contentType = headers.get('content-type')
    if (contentType.includes('application/json'))
        return await response.json()
    return await response.text()
}
