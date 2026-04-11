import UIKit

class MainTabBarController: UITabBarController {

    override func viewDidLoad() {
        super.viewDidLoad()
        setupTabs()
        setupAppearance()
    }
    
    
    private func setupTabs() {
        let homeNav = createNav(
            title: "Home",
            image: "house",
            selectedImage: "house.fill",
            root: HomeViewController()
        )
        let questionNav = createNav(
            title: "Questions",
            image: "folder.fill.badge.questionmark",
            selectedImage: "folder.fill.badge.questionmark",
            root: QuestionViewController()
        )
        let examNav = createNav(
            title: "Exam",
            image: "checkmark.rectangle.stack.fill",
            selectedImage: "checkmark.rectangle.stack.fill",
            root: ExamViewController()
        )
        let profileNav = createNav(
            title: "Me",
            image: "person",
            selectedImage: "person.fill",
            root: ProfileViewController()
        )

        viewControllers = [homeNav, questionNav, examNav, profileNav]
        selectedIndex = 1
    }
    

    private func createNav(
        title: String,
        image: String,
        selectedImage: String,
        root: UIViewController
    ) -> UINavigationController {
        let nav = UINavigationController(rootViewController: root)
        nav.tabBarItem = UITabBarItem(
            title: title,
            image: UIImage(systemName: image),
            selectedImage: UIImage(systemName: selectedImage)
        )
        return nav
    }

    private func setupAppearance() {
        let appearance = UITabBarAppearance()
        appearance.configureWithTransparentBackground()
        appearance.backgroundColor = .clear

        appearance.stackedLayoutAppearance.selected.iconColor = .systemBlue
        appearance.stackedLayoutAppearance.selected.titleTextAttributes = [
            .foregroundColor: UIColor.systemBlue
        ]

        appearance.stackedLayoutAppearance.normal.iconColor = .systemGray
        appearance.stackedLayoutAppearance.normal.titleTextAttributes = [
            .foregroundColor: UIColor.systemGray
        ]

        tabBar.standardAppearance = appearance

        if #available(iOS 15.0, *) {
            tabBar.scrollEdgeAppearance = appearance
        }
    }
}

