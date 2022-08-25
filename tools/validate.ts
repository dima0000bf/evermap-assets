import Ajv from "ajv"
import * as fs from 'fs/promises'
import * as yaml from 'js-yaml'

const PROJECTS_FOLDER = 'projects'

const INDEX_FILES_NAMES = [
  '_index.json',
  '_hot.index.json',
  '_popular.index.json',
]

const PROJECTS_FILES_NAMES = fs
  .readdir('projects')
  .then(
    names => names.filter(
      name => !INDEX_FILES_NAMES.includes(name)
    )
  )

const ajv = new Ajv()

function toJson(text: string) {
  try {
    return JSON.parse(text)
  }
  catch {
    return yaml.load(text)
  }
}

async function checkIndexFiles() {
  await Promise.all(
    INDEX_FILES_NAMES.map(async name => {
      const content = (await fs.readFile(`${PROJECTS_FOLDER}/${name}`)).toString()
      toJson(content)

      console.log(`valid ${name}`);
    })
  )
}

function checkProjectFile(content: string, schema: object) {
  const jsonContent = toJson(content)
  
  const validate = ajv.compile(schema)

  return validate(jsonContent)
}

async function main() {
  await checkIndexFiles()

  console.log('---------------');
  

  const schema = toJson(
    (await fs.readFile('./manifest.json')).toString()
  );

  (await PROJECTS_FILES_NAMES)
    .map(async name => {
      const content = (await fs.readFile(`${PROJECTS_FOLDER}/${name}`)).toString()

      const valid = checkProjectFile(content, schema)

      if (!valid) {
        throw new Error(`${name} is invalid !`);
      }

      console.log(`valid ${name}`);
    })
}

main()
