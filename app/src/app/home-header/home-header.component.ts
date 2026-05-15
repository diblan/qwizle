import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type HeaderMenu = 'settings' | 'account';

@Component({
  selector: 'app-home-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss'],
})
export class HomeHeaderComponent {
  readonly openMenu = signal<HeaderMenu | null>(null);

  toggleMenu(menu: HeaderMenu): void {
    this.openMenu.update((currentMenu) => (currentMenu === menu ? null : menu));
  }

  closeMenus(): void {
    this.openMenu.set(null);
  }

  isOpen(menu: HeaderMenu): boolean {
    return this.openMenu() === menu;
  }
}
