
// const chalk = require("chalk")
const axios = require('axios');
const cheerio = require("cheerio")
const schedule = require('node-schedule');

const imgData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAlCAIAAACs1XwQAAABSGlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8bAyiDCwMnAxKCfmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsisBReZnn+64TBnmdAk7wTp+2KY6lEAV0pqcTKQ/gPEackFRSUMDIwpQLZyeUkBiN0BZIsUAR0FZM8BsdMh7A0gdhKEfQSsJiTIGci+AWQLJGckAs1gfAFk6yQhiacjsaH2ggCPi6uPj0KokbmhpQsB55IOSlIrSkC0c35BZVFmekaJgiMwlFIVPPOS9XQUjAyMjBgYQGEOUf05CByWjGL7EGL5SxgYLL4xMDBPRIglTWFg2N7GwCBxCyGmMo+Bgb+FgWHboYLEokS4Axi/sRSnGRtB2Dz2DAysd////6zBwMA+kYHh78T//38v/v//72Kg+bcZGA5UAgDl9WCz3QFgQwAAAGxlWElmTU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAABIAAAAAQAAAEgAAAABAAKgAgAEAAAAAQAAACCgAwAEAAAAAQAAACUAAAAAF1U5fAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAV1JREFUSA3tVEFKw1AQteIuy7pJIDmDDbEbLeQgdqVST6MuG21cGC+gpXoAdZt6hgSSE2RlBF/5MHzmI5MWshB+CeXNZOa9zJv8DH7a770+f/t9km+4rYDosLXIWiQ6IBb8/7foQJwxy57mSdI0jVjpOM7VbDadnumVA/FrenI6Uey+75dlqTebGBqfH+96Xt6BYn9I0+XL812S6M0mNgeVBcASBEEYjgDG42PMofMeDoe49AzDnQSKosjzNTrxr7vkeV6WPeICYLwUyjs4GoWqGnNAiTpBmi7uXddFpq7r84vLqqqAv9Y51QB0mkA1tG17e3OtHlZnx13IQEznJdxVQDHGcQyiKIro2YlIjUIhga4Wvb2u/qIgLmXmjhaJ7CTDgHyScXbwdtOqWT8LUcwy8g5w+s02xqJClKGY3ZJ3wBq2DeUJtmVk9VaAGWKG1iLTE5axFjFDzLB3i34B41xqVn2kfW4AAAAASUVORK5CYII="

const text = {
  "msgtype": "text",
  "text": {
    "content": "这次自行车自行车"
  }
}

const img = {
  "msgtype": "image",
  "image": {
    "base64": imgData,
    "md5": "MD5"
  }
}

async function loadPage() {
  // 加载知乎日报
  const { data } = await axios.get("http://daily.zhihu.com/")
  const $ = cheerio.load(data);
  const length = $(".title").length
  const result = ["知乎日报"]
  // http://daily.zhihu.com/story/9748771
  for (let i = 0; i < length; i++) {
    result.push({
      title: $(".title")[i].children[0].data,
      url: "http://daily.zhihu.com" + $(".link-button")[i].attribs.href,
    })
  }
  console.log(result);
  // console.log(data);


  return {
    "msgtype": "markdown",
    "markdown": {
      "content": result.map((item, index) => {
        return index > 0 ? `[${item.title}](${item.url})` : item
      }).join("\n\n>")
    }
  }
}



const main = async () => {
  const data = await loadPage()
  axios.post('https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=df307165-ea8c-432e-b9a8-66dd90b38775', data)
    .then(res => {
      // const { data } = res.data
      // data.forEach(item => {
      //     // console.log(`${chalk.yellow.bold(item.rank)}.${chalk.green(item.category_name)}`);
      // })
    })
    .catch(err => {
      console.log('Error: ', err.message);
    });
}
// main();

const job = schedule.scheduleJob("0 0 11 * * *", () => {
  // console.log(new Date().toLocaleDateString());
  main();
})


// ["a", "b", "c"].reduce((all, item) => { all[item] = {}; return all }, {})