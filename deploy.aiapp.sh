# 
# maven local => local repository
#

CURRENT_DIR=$(cd $(dirname $0);pwd)

# SWAGGER_MAVEN_REPOSITORY_UP username:password
if [ -z $SWAGGER_MAVEN_REPOSITORY_UP ]; then
  echo [ERROR] no env SWAGGER_MAVEN_REPOSITORY_UP
  exit 1
fi

pushd $CURRENT_DIR > /dev/null

VERSION=$(cat .version)

echo springfox version $VERSION

# io/springfox/springfox-swagger-ui/2.9.2-cloud
#find . -type f -not -path './mavenimport\.sh*' -not -path '*/\.*' -not -path '*/\^archetype\-catalog\.xml*' -not -path '*/\^maven\-metadata\-local*\.xml' -not -path '*/\^maven\-metadata\-deployment*\.xml' | sed "s|^\./||" | xargs -I '{}' curl -u "admin:adminX2022" -X PUT -v -T {} 'http://nexus.lab.bigai.site/repository/aiapp/'/{} ;

cd ~/.m2/repository/
find . -type f | grep springfox-swagger-ui | grep $VERSION | sed "s|^\./||" | xargs -I '{}' curl -u "$SWAGGER_MAVEN_REPOSITORY_UP" -X PUT -v -T {} 'http://nexus.lab.bigai.site/repository/aiapp/'/{} ;