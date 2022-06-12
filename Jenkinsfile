def repoUrlPrefix = "memphisos"
def imageName = "memphis-ui-staging"
def gitURL = "git@github.com:Memphisdev/memphis-ui.git"
def gitBranch = "staging"
def namespace = "memphis"
def test_suffix = "test"
String unique_id = org.apache.commons.lang.RandomStringUtils.random(4, false, true)

node {
  git credentialsId: 'main-github', url: gitURL, branch: gitBranch
  def versionTag = readFile "./version.conf"
	
	
  try{

    stage('Login to Docker Hub') {
	    withCredentials([usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'DOCKER_HUB_CREDS_USR', passwordVariable: 'DOCKER_HUB_CREDS_PSW')]) {
		  sh 'docker login -u $DOCKER_HUB_CREDS_USR -p $DOCKER_HUB_CREDS_PSW'
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
      sh "docker buildx build --push -t ${repoUrlPrefix}/${imageName}-${test_suffix} ."
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
        git credentialsId: 'main-github', url: 'git@github.com:memphisdev/memphis-infra.git', branch: 'master'
      }
      sh "docker-compose -f ./memphis-infra/staging/docker/docker-compose-dev-memphis-ui.yml -p memphis up -d"
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
      sh "docker-compose -f ./memphis-infra/staging/docker/docker-compose-dev-memphis-ui.yml -p memphis down"
      sh "docker volume prune -f"
    }

    ////////////////////////////////////////
    ////////////   Kubernetes   ////////////
    ////////////////////////////////////////

  
    stage('Tests - Install Memphis with helm') {
      sh "helm install memphis-tests memphis-infra/staging/kubernetes/helm/memphis --set analytics='false',teston='ui' --create-namespace --namespace memphis-$unique_id"
      sh "sleep 60"
    }

    stage('Open port forwarding to Memphis service') {
      sh "nohup kubectl port-forward service/memphis-ui 9000:80 --namespace memphis-$unique_id &"
      sh "sleep 5"
      sh "nohup kubectl port-forward service/memphis-cluster 7766:7766 6666:6666 5555:5555 --namespace memphis-$unique_id &"
      sh "sleep 5"
    }

    stage('Tests - Run e2e tests over kubernetes') {
      sh "npm install --prefix ./memphis-e2e-tests"
      sh "node ./memphis-e2e-tests/index.js kubernetes memphis-$unique_id"
    }

    stage('Tests - Uninstall helm') {
      sh "helm uninstall memphis-tests -n memphis-$unique_id"
      sh "kubectl delete ns memphis-$unique_id &"
    }

    stage('Tests - Remove used directories') {
      sh "rm -rf memphis-e2e-tests"
    }

    stage('Build and push image to Docker Hub') {
       sh "docker buildx use builder"
       sh "docker buildx build --push --tag ${repoUrlPrefix}/${imageName}:${versionTag} --tag ${repoUrlPrefix}/${imageName} --platform linux/amd64,linux/arm64 ."
    }
	  
	  
    stage('Push to staging'){
      sh "aws eks --region eu-central-1 update-kubeconfig --name staging-cluster"
      sh "helm uninstall my-memphis --kubeconfig /var/lib/jenkins/.kube/memphis-staging-kubeconfig.yaml -n memphis"
      sh 'helm install my-memphis memphis-infra/staging/kubernetes/helm/memphis --set analytics="false" --kubeconfig /var/lib/jenkins/.kube/memphis-staging-kubeconfig.yaml --create-namespace --namespace memphis'
      sh "rm -rf memphis-infra"
    }



    notifySuccessful()
    
  } catch (e) {
      currentBuild.result = "FAILED"
      sh "docker-compose -f ./memphis-infra/staging/docker/docker-compose-dev-memphis-control-plane.yml -p memphis down &"
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
