def repoUrlPrefix = "memphisos"
def imageName = "memphis-ui"
def gitURL = "git@github.com:Memphisdev/memphis-ui.git"
def gitBranch = "beta"
def branchTag = "beta"
String unique_id = org.apache.commons.lang.RandomStringUtils.random(4, false, true)
def namespace = "memphis"
def test_suffix = "test"
//def DOCKER_HUB_CREDS = credentials('docker-hub')



node {
  git credentialsId: 'main-github', url: gitURL, branch: gitBranch
  def versionTag = readFile "./version.conf"
	
  try{
    stage('SCM checkout') {
        git credentialsId: 'main-github', url: gitURL, branch: gitBranch
    }

    stage('Login to Docker Hub') {
	    withCredentials([usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'DOCKER_HUB_CREDS_USR', passwordVariable: 'DOCKER_HUB_CREDS_PSW')]) {
		  sh "docker login -u $DOCKER_HUB_CREDS_USR -p $DOCKER_HUB_CREDS_PSW"
	    }
    }

    stage('Create memphis namespace in Kubernetes'){
      sh "kubectl config use-context minikube"
      sh "kubectl create namespace memphis-$unique_id --dry-run=client -o yaml | kubectl apply -f -"
      sh "aws s3 cp s3://memphis-jenkins-backup-bucket/regcred.yaml ."
      sh "kubectl apply -f regcred.yaml -n memphis-$unique_id"
      sh "kubectl patch serviceaccount default -p '{\"imagePullSecrets\": [{\"name\": \"regcred\"}]}' -n memphis-$unique_id"
      //sh "sleep 40"
    }

    stage('Build and push docker image to Docker Hub') {
      sh "docker buildx build --push -t ${repoUrlPrefix}/${imageName}-${branchTag}-${test_suffix} ."
    }

    stage('Tests - Install/upgrade Memphis cli') {
      sh "sudo npm uninstall memphis-dev-cli"
      sh "sudo npm i memphis-dev-cli -g"
    }

    
    ////////////////////////////////////////
    //////////// Docker-Compose ////////////
    ////////////////////////////////////////

    stage('Tests - Docker compose install') {
      sh "rm -rf memphis-infra"
      dir ('memphis-infra'){
        git credentialsId: 'main-github', url: 'git@github.com:memphisdev/memphis-infra.git', branch: 'beta'
      }
      sh "docker-compose -f ./memphis-infra/docker/docker-compose-dev-memphis-ui.yml -p memphis up -d"
    }

    stage('Tests - Run e2e tests over Docker') {
      sh "rm -rf memphis-e2e-tests"
      dir ('memphis-e2e-tests'){
        git credentialsId: 'main-github', url: 'git@github.com:memphisdev/memphis-e2e-tests.git', branch: 'master'
      }
      sh "npm install --prefix ./memphis-e2e-tests"
      sh "node ./memphis-e2e-tests/index.js docker"
    }

    stage('Tests - Remove Docker compose') {
      sh "docker-compose -f ./memphis-infra/docker/docker-compose-dev-memphis-ui.yml -p memphis down"
      sh "docker volume prune -f"
    }

    ////////////////////////////////////////
    ////////////   Kubernetes   ////////////
    ////////////////////////////////////////

    stage('Tests - Install memphis with helm') {
      sh "helm install memphis-tests memphis-infra/kubernetes/helm/memphis --set analytics='false',teston='ui' --create-namespace --namespace memphis-$unique_id"
    }

    stage('Open port forwarding to memphis service') {
      sh(script: """until kubectl get pods --selector=app=memphis-ui -o=jsonpath="{.items[*].status.phase}" -n memphis-$unique_id  | grep -q "Running" ; do sleep 1; done""", returnStdout: true)
      sh "nohup kubectl port-forward service/memphis-ui 9000:80 --namespace memphis-$unique_id &"
      sh "nohup kubectl port-forward service/memphis-cluster 7766:7766 6666:6666 5555:5555 --namespace memphis-$unique_id &"
    }

    stage('Tests - Run e2e tests over kubernetes') {
      //sh "npm install --prefix ./memphis-e2e-tests"
      sh "node ./memphis-e2e-tests/index.js kubernetes memphis-$unique_id"
    }

    stage('Tests - Uninstall helm') {
      sh "helm uninstall memphis-tests -n memphis-$unique_id"
      sh "kubectl delete ns memphis-$unique_id &"
      sh(script: """/usr/sbin/lsof -i :5555,9000 | grep kubectl | awk '{print \"kill -9 \"\$2}' | sh""", returnStdout: true)
    }

    stage('Tests - Remove used directories') {
      sh "rm -rf memphis-infra"
      //sh "rm -rf memphis-e2e-tests"
    }


    ////////////////////////////////////////
    ////////////  Build & Push  ////////////
    ////////////////////////////////////////

    stage('Build and push image to Docker Hub') {
      sh "docker buildx use builder"
      sh "docker buildx build --push --tag ${repoUrlPrefix}/${imageName}:beta --platform linux/amd64,linux/arm64 ."
    }

    ////////////////////////////////////////
    //////////// Test BETA Repo ////////////
    ////////////////////////////////////////

    stage('Tests - Docker compose install') {
      sh "rm -rf memphis-docker"
      dir ('memphis-docker'){
        git credentialsId: 'main-github', url: 'git@github.com:memphisdev/memphis-docker.git', branch: 'master'
      }
      sh "docker-compose -f ./memphis-docker/docker-compose-beta.yml -p memphis up -d"
    }

    stage('Tests - Run e2e tests over Docker') {
      //sh "npm install --prefix ./memphis-e2e-tests"
      sh "node ./memphis-e2e-tests/index.js docker"
    }

    stage('Tests - Remove Docker compose') {
      sh "docker-compose -f ./memphis-docker/docker-compose-beta.yml -p memphis down"
      sh "rm -rf memphis-docker"
      sh "rm -rf memphis-e2e-tests"
    }

    notifySuccessful()

 } catch (e) {
      currentBuild.result = "FAILED"
      sh "kubectl delete ns memphis-$unique_id &"
      cleanWs()
      notifyFailed()
      throw e
  }
}

def notifySuccessful() {
  emailext (
      subject: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
      body: """<p>SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
        <p>Check console output at &QUOT;<a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>&QUOT;</p>""",
      recipientProviders: [[$class: 'DevelopersRecipientProvider']]
    )
}

def notifyFailed() {
  emailext (
      subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
      body: """<p>FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
        <p>Check console output at &QUOT;<a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>&QUOT;</p>""",
      recipientProviders: [[$class: 'DevelopersRecipientProvider']]
    )
}
