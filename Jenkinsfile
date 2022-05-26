def repoUrlPrefix = "memphisos"
def imageName = "memphis-ui"
def gitURL = "git@github.com:Memphis-OS/memphis-ui.git"
def gitBranch = "staging"
def namespace = "memphis"
def test_suffix = "test"
unique_Id = UUID.randomUUID().toString()

node {
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
      sh "kubectl create namespace memphis-$unique_id --dry-run=client -o yaml | kubectl apply -f -"
      //sh "sleep 40"
    }

    stage('Build and push docker image to Docker Hub') {
      sh "docker buildx build --push -t ${repoUrlPrefix}/${imageName}-${test_suffix} --platform linux/amd64,linux/arm64 ."
    }

    stage('Tests - Install/upgrade Memphis cli') {
      sh "sudo npm uninstall memphis-dev-cli"
      sh "sudo npm i memphis-dev-cli -g"
    }

    ////////////////////////////////////////
    //////////// Docker-Compose ////////////
    ////////////////////////////////////////

    stage('Tests - Docker compose install') {
      sh "docker-compose -f /var/lib/jenkins/tests/docker-compose-files/docker-compose-dev-memphis-ui.yml -p memphis up -d"
    }

    stage('Tests - Run e2e tests over Docker') {
      sh "rm -rf memphis-e2e-tests"
      sh "git clone git@github.com:Memphis-OS/memphis-e2e-tests.git"
      sh "npm install --prefix ./memphis-e2e-tests"
      sh "node ./memphis-e2e-tests/index.js docker"
    }

    stage('Tests - Remove Docker compose') {
      sh "docker-compose -f /var/lib/jenkins/tests/docker-compose-files/docker-compose-dev-memphis-ui.yml -p memphis down"
    }

    ////////////////////////////////////////
    ////////////   Kubernetes   ////////////
    ////////////////////////////////////////

  
    stage('Tests - Install Memphis with helm') {
      sh "rm -rf memphis-k8s"
      sh "git clone --branch staging git@github.com:Memphis-OS/memphis-k8s.git"
      sh "helm install memphis-tests memphis-k8s/helm/memphis --set analytics="false",teston="ui" --create-namespace --namespace memphis-$unique_id"
      sh "sleep 40"
    }

    stage('Open port forwarding to Memphis service') {
      sh "nohup kubectl port-forward service/memphis-ui 9000:80 --namespace memphis-$unique_id &"
      sh "sleep 5"
      sh "nohup kubectl port-forward service/memphis-cluster 7766:7766 6666:6666 5555:5555 --namespace memphis-$unique_id &"
      sh "sleep 5"
    }

    stage('Tests - Run e2e tests over kubernetes') {
      sh "npm install --prefix ./memphis-e2e-tests"
      sh "node ./memphis-e2e-tests/index.js kubernetes"
    }

    stage('Tests - Uninstall helm') {
      sh "helm uninstall memphis-tests -n memphis-$unique_id"
      sh "kubectl delete ns memphis-$unique_id &"
    }

    stage('Tests - Remove e2e-tests') {
      sh "rm -rf memphis-e2e-tests"
    }

    /*
    stage('Build and push image to Docker Hub') {
      sh "docker buildx build --push -t ${repoUrlPrefix}/${imageName} --platform linux/amd64,linux/arm64 ."
    }

    stage('Push to staging'){
      sh "helm uninstall my-memphis --kubeconfig /var/lib/jenkins/.kube/memphis-staging-kubeconfig.yaml -n memphis"
      sh 'helm install my-memphis memphis-k8s/helm/memphis --set analytics="false" --kubeconfig /var/lib/jenkins/.kube/memphis-staging-kubeconfig.yaml --create-namespace --namespace memphis'
    }*/



    notifySuccessful()
    
  } catch (e) {
      currentBuild.result = "FAILED"
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
